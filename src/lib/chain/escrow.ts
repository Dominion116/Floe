import { bcs } from "@mysten/sui/bcs";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, normalizeStructTag, normalizeSuiAddress } from "@mysten/sui/utils";
import type { CardThemeId } from "@/lib/types";
import { COIN_TYPES, DECIMALS, GRAPHQL_URL, NETWORK, PACKAGE_ID, RPC_URL, type Token } from "./config";

export const suiClient = new SuiGrpcClient({ network: NETWORK, baseUrl: RPC_URL });

/** Full nodes prune old transactions, so anything about the past is read from GraphQL. */
const history = new SuiGraphQLClient({ network: NETWORK, url: GRAPHQL_URL }).core;

/** Order is the on-chain theme_id. Append only. */
const THEMES: CardThemeId[] = ["glacial", "coffee", "birthday", "water"];
export const themeIndex = (id: CardThemeId) => THEMES.indexOf(id);

// ── Amounts ────────────────────────────────────────────────────────────────

/** Decimal to base units at four places, without float drift. */
export function toUnits(amount: number): bigint {
  const [whole, fraction = ""] = amount.toFixed(4).split(".");
  return BigInt(whole + fraction.padEnd(DECIMALS, "0"));
}

export const fromUnits = (units: bigint | string): number => Number(units) / 10 ** DECIMALS;

// ── Reading ────────────────────────────────────────────────────────────────

// Field order must match PaymentEscrow in move/sources/escrow.move.
const EscrowLayout = bcs.struct("PaymentEscrow", {
  id: bcs.Address,
  balance: bcs.u64(),
  sender: bcs.Address,
  ephemeral_pubkey: bcs.vector(bcs.u8()),
  expires_at_ms: bcs.u64(),
  water_donation: bcs.u64(),
  theme_id: bcs.u8(),
});

const ClaimedLayout = bcs.struct("EscrowClaimed", {
  escrow_id: bcs.Address,
  recipient: bcs.Address,
  amount: bcs.u64(),
  water_donation: bcs.u64(),
});

const ReclaimedLayout = bcs.struct("EscrowReclaimed", {
  escrow_id: bcs.Address,
  sender: bcs.Address,
  amount: bcs.u64(),
});

export interface Escrow {
  id: string;
  token: Token;
  amountUnits: bigint;
  waterUnits: bigint;
  sender: string;
  expiresAt: number;
  themeId: CardThemeId;
}

export type Closed =
  | { kind: "claimed"; recipient: string; at: number | null }
  | { kind: "reclaimed"; at: number | null };

function tokenOfEscrowType(type: string): Token | null {
  const match = /^(0x[0-9a-fA-F]+)::escrow::PaymentEscrow<(.+)>$/.exec(type);
  if (!match || !PACKAGE_ID || normalizeSuiAddress(match[1]) !== PACKAGE_ID) return null;
  const coinType = normalizeStructTag(match[2]);
  const token = (Object.keys(COIN_TYPES) as Token[]).find(
    (t) => normalizeStructTag(COIN_TYPES[t]) === coinType
  );
  return token ?? null;
}

function parseEscrow(type: string, content: Uint8Array): Escrow | null {
  const token = tokenOfEscrowType(type);
  if (!token) return null;
  const raw = EscrowLayout.parse(content);
  return {
    id: raw.id,
    token,
    amountUnits: BigInt(raw.balance),
    waterUnits: BigInt(raw.water_donation),
    sender: raw.sender,
    expiresAt: Number(raw.expires_at_ms),
    themeId: THEMES[raw.theme_id] ?? "glacial",
  };
}

const isMissing = (err: Error) => {
  const { reason, code } = err as Error & { reason?: string; code?: string };
  return reason === "notFound" || reason === "deleted" || code === "notExists";
};

/** Open escrows by ID. `null` means it no longer exists; absent means it couldn't be read. */
export async function readEscrows(ids: string[]): Promise<Map<string, Escrow | null>> {
  const found = new Map<string, Escrow | null>();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const { objects } = await suiClient.getObjects({ objectIds: batch, include: { content: true } });
    objects.forEach((obj, idx) => {
      if (obj instanceof Error) {
        if (isMissing(obj)) found.set(batch[idx], null);
        return;
      }
      const escrow = parseEscrow(obj.type, obj.content);
      if (escrow) found.set(batch[idx], escrow);
    });
  }
  return found;
}

/** How a deleted escrow ended, from the event in the transaction that closed it. */
export async function readClosed(escrowId: string): Promise<Closed | null> {
  let before: string | undefined;
  // A page can be empty while the node is still scanning, so follow the cursor briefly.
  for (let page = 0; page < 5; page++) {
    const res = await history.listTransactions({
      filter: { affectedObject: escrowId },
      order: "descending",
      limit: 2,
      before,
      include: { events: true },
    });
    for (const result of res.transactions) {
      const tx = result.Transaction;
      if (!tx) continue;
      for (const event of tx.events) {
        const [pkg, , name] = event.eventType.split("::");
        if (normalizeSuiAddress(pkg) !== PACKAGE_ID) continue;
        if (name === "EscrowClaimed") {
          const data = ClaimedLayout.parse(event.bcs);
          if (data.escrow_id === escrowId) {
            return { kind: "claimed", recipient: data.recipient, at: tx.timestampMs };
          }
        }
        if (name === "EscrowReclaimed") {
          const data = ReclaimedLayout.parse(event.bcs);
          if (data.escrow_id === escrowId) return { kind: "reclaimed", at: tx.timestampMs };
        }
      }
    }
    if (!res.hasNextPage || !res.endCursor) return null;
    before = res.endCursor;
  }
  return null;
}

export type CreateOutcome =
  | { status: "created"; escrowId: string }
  | { status: "failed" }
  /** The node answered, and doesn't have it (yet). */
  | { status: "missing" }
  /** The node couldn't be asked. Never treat as failure. */
  | { status: "unknown" };

/**
 * Looks a transaction up by digest. `missing` means the network answered and doesn't have it (yet).
 * `unknown` means it couldn't be asked, and must never be treated as failure.
 */
export async function findTransaction(digest: string) {
  // The full node has it first, and history has it longest. Only both can say it's missing.
  let missing = 0;
  for (const source of [suiClient.core, history]) {
    try {
      return await source.getTransaction({ digest, include: { effects: true, objectTypes: true } });
    } catch (err) {
      if (err instanceof Error && /not found/i.test(err.message)) missing++;
    }
  }
  return missing === 2 ? "missing" : "unknown";
}

/** What became of a create transaction. */
export async function readCreated(digest: string): Promise<CreateOutcome> {
  const result = await findTransaction(digest);
  if (result === "missing" || result === "unknown") return { status: result };
  const escrowId = result.Transaction && createdEscrowId(result.Transaction);
  return escrowId ? { status: "created", escrowId } : { status: "failed" };
}

interface CreatedTransaction {
  effects: { changedObjects: { objectId: string; idOperation: string }[] };
  objectTypes: Record<string, string>;
}

export function createdEscrowId(tx: CreatedTransaction): string | null {
  const created = tx.effects.changedObjects.find(
    (o) => o.idOperation === "Created" && tokenOfEscrowType(tx.objectTypes[o.objectId] ?? "")
  );
  return created?.objectId ?? null;
}

// ── Writing ────────────────────────────────────────────────────────────────

function target(fn: string): string {
  if (!PACKAGE_ID) throw new Error("The Floe contract isn’t configured on this site yet.");
  return `${PACKAGE_ID}::escrow::${fn}`;
}

export function buildCreate(input: {
  token: Token;
  amountUnits: bigint;
  waterUnits: bigint;
  publicKeyHex: string;
  durationMs: number;
  themeId: CardThemeId;
}): Transaction {
  const coinType = COIN_TYPES[input.token];
  const tx = new Transaction();
  tx.moveCall({
    target: target("create_escrow"),
    typeArguments: [coinType],
    arguments: [
      tx.coin({ type: coinType, balance: input.amountUnits + input.waterUnits }),
      tx.pure.vector("u8", Array.from(fromHex(input.publicKeyHex))),
      tx.pure.u64(input.durationMs),
      tx.pure.u64(input.waterUnits),
      tx.pure.u8(themeIndex(input.themeId)),
      tx.object.clock(),
    ],
  });
  return tx;
}

export function buildReclaim(escrow: Pick<Escrow, "id" | "token">): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: target("reclaim_escrow"),
    typeArguments: [COIN_TYPES[escrow.token]],
    arguments: [tx.object(escrow.id)],
  });
  return tx;
}

export const claimTarget = () => target("claim_escrow");

/** Must match claim_message in move/sources/escrow.move: escrow ID, then recipient. */
export function claimMessage(escrowId: string, recipient: string): Uint8Array {
  const id = bcs.Address.serialize(escrowId).toBytes();
  const to = bcs.Address.serialize(recipient).toBytes();
  const msg = new Uint8Array(id.length + to.length);
  msg.set(id);
  msg.set(to, id.length);
  return msg;
}

/** Signs in the browser. The private key itself is never put in the transaction. */
export async function buildClaim(
  escrow: Pick<Escrow, "id" | "token">,
  privateKey: string,
  recipient: string
): Promise<Transaction> {
  const keypair = Ed25519Keypair.fromSecretKey(privateKey);
  const signature = await keypair.sign(claimMessage(escrow.id, recipient));
  const tx = new Transaction();
  tx.setSender(recipient);
  tx.moveCall({
    target: claimTarget(),
    typeArguments: [COIN_TYPES[escrow.token]],
    arguments: [
      tx.object(escrow.id),
      tx.pure.vector("u8", Array.from(signature)),
      tx.pure.address(recipient),
      tx.object.clock(),
    ],
  });
  return tx;
}

// ── Errors ─────────────────────────────────────────────────────────────────

/** A short explanation for the person, without leaking raw node output. */
export function chainErrorMessage(err: unknown, fallback: string): string {
  const text = err instanceof Error ? err.message : String(err);
  if (/popup closed/i.test(text)) return "The login window closed before you finished.";
  if (/reject|denied|cancel|closed/i.test(text)) return "The request was cancelled.";
  if (/popup/i.test(text)) return "Your browser blocked the login window. Allow pop-ups, then try again.";
  if (/insufficient|not enough|balance.*(low|too)|no valid gas/i.test(text)) {
    return "The wallet doesn’t have enough to cover the amount and network fee.";
  }
  if (/isn’t configured/.test(text)) return text;
  return fallback;
}
