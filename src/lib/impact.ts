import { normalizeStructTag, normalizeSuiAddress } from "@mysten/sui/utils";
import { COIN_TYPES, GRAPHQL_URL, PACKAGE_ID, WATER_TREASURY, type Token } from "./chain/config";
import type { Impact } from "./types";

// Server only. Used by /api/impact.

const TIMEOUT_MS = 8_000;
const CACHE_MS = 60_000;
/** How long the last good totals survive an outage. */
const MAX_OUTAGE_MS = 10 * 60_000;
/** Claims per page, the most the endpoint allows. */
const PAGE_SIZE = 50;
/** The rest is read by the next request, which carries on from here. */
const MAX_PAGES = 12;

const TOKENS = Object.keys(COIN_TYPES) as Token[];
const TOKEN_BY_TYPE = new Map(TOKENS.map((token) => [normalizeStructTag(COIN_TYPES[token]), token]));

const QUERY = `query ($type: String!, $first: Int!, $after: String) {
  events(first: $first, after: $after, filter: { type: $type }) {
    pageInfo { hasNextPage endCursor }
    nodes {
      contents { json }
      transaction {
        digest
        effects {
          balanceChanges { nodes { owner { address } amount coinType { repr } } }
        }
      }
    }
  }
}`;

interface ClaimNode {
  contents: { json: { water_donation: string } } | null;
  transaction: {
    digest: string;
    effects: {
      balanceChanges: {
        nodes: {
          owner: { address: string } | null;
          amount: string;
          coinType: { repr: string } | null;
        }[];
      };
    } | null;
  } | null;
}

interface Page {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: ClaimNode[];
}

async function readPage(after: string | null): Promise<Page> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: QUERY,
      variables: { type: `${PACKAGE_ID}::escrow::EscrowClaimed`, first: PAGE_SIZE, after },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Sui responded ${res.status}`);
  const body = (await res.json()) as { data?: { events?: Page | null }; errors?: unknown };
  if (!body.data?.events || body.errors) throw new Error("Unexpected response from Sui");
  return body.data.events;
}

/** What the treasury received in one transaction, by token. */
function receivedBy(node: ClaimNode): Map<Token, bigint> {
  const received = new Map<Token, bigint>();
  for (const change of node.transaction?.effects?.balanceChanges.nodes ?? []) {
    if (!change.owner || normalizeSuiAddress(change.owner.address) !== WATER_TREASURY) continue;
    const token = change.coinType && TOKEN_BY_TYPE.get(normalizeStructTag(change.coinType.repr));
    const amount = BigInt(change.amount);
    if (token && amount > BigInt(0)) received.set(token, (received.get(token) ?? BigInt(0)) + amount);
  }
  return received;
}

// Everything counted so far. Later requests only read what is new.
const total = {
  cursor: null as string | null,
  donated: new Map<Token, bigint>(),
  roundups: 0,
  claims: 0,
  /** Left to match in the transaction read last, which can span two pages. */
  last: { digest: "", received: new Map<Token, bigint>() },
};

/**
 * Counts a claim's roundup only as far as the treasury really received it in a supported coin.
 * The event doesn't name its coin, and anyone can make an escrow of a worthless one.
 */
function count(node: ClaimNode): void {
  total.claims++;
  const digest = node.transaction?.digest;
  if (!digest) return;
  if (digest !== total.last.digest) total.last = { digest, received: receivedBy(node) };

  let left = BigInt(node.contents?.json.water_donation ?? 0);
  let counted = false;
  for (const [token, received] of total.last.received) {
    const amount = received < left ? received : left;
    if (amount <= BigInt(0)) continue;
    total.last.received.set(token, received - amount);
    total.donated.set(token, (total.donated.get(token) ?? BigInt(0)) + amount);
    left -= amount;
    counted = true;
  }
  if (counted) total.roundups++;
}

async function load(): Promise<Impact> {
  if (!PACKAGE_ID) throw new Error("The Floe contract isn’t configured");

  let complete = false;
  for (let page = 0; page < MAX_PAGES && !complete; page++) {
    const { nodes, pageInfo } = await readPage(total.cursor);
    nodes.forEach(count);
    total.cursor = pageInfo.endCursor ?? total.cursor;
    complete = !pageInfo.hasNextPage;
  }

  const units = (token: Token) => (total.donated.get(token) ?? BigInt(0)).toString();
  return {
    donated: { SUI: units("SUI"), LOFI: units("LOFI") },
    roundups: total.roundups,
    claims: total.claims,
    complete,
  };
}

let cached: { impact: Impact; at: number } | null = null;
let inflight: Promise<Impact> | null = null;

/** Roundups paid to the water treasury by Floe claims, read from Sui. */
export async function getImpact(): Promise<Impact> {
  if (cached?.impact.complete && Date.now() - cached.at < CACHE_MS) return cached.impact;

  // Shared, so two requests never count the same page.
  inflight ??= load().finally(() => {
    inflight = null;
  });

  try {
    const impact = await inflight;
    cached = { impact, at: Date.now() };
    return impact;
  } catch (err) {
    console.warn("Impact totals failed", err instanceof Error ? err.message : err);
    if (cached && Date.now() - cached.at < MAX_OUTAGE_MS) return cached.impact;
    throw err;
  }
}
