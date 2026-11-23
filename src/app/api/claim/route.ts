import { NextResponse } from "next/server";
import { enoki, isStaleTransactionError } from "@mysten/enoki/client";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64, normalizeSuiAddress } from "@mysten/sui/utils";
import { NETWORK, PACKAGE_ID, RPC_URL, WATER_TREASURY } from "@/lib/chain/config";
import { claimTarget } from "@/lib/chain/escrow";

export const dynamic = "force-dynamic";

const MAX_LENGTH = 20_000;

const fail = (error: string, status: number, code?: string) =>
  NextResponse.json({ error, code }, { status });

/**
 * Pays the gas for one claim. It receives a transaction the recipient has already signed,
 * which holds a signature made with the link's key but never the key itself.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ENOKI_SECRET_KEY;
  if (!apiKey || !PACKAGE_ID) return fail("Claiming isn’t set up on this site yet.", 503);

  let bytes: string;
  let signature: string;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.bytes !== "string" || typeof body.signature !== "string") throw new Error();
    if (body.bytes.length > MAX_LENGTH || body.signature.length > MAX_LENGTH) throw new Error();
    ({ bytes, signature } = body as { bytes: string; signature: string });
  } catch {
    return fail("The claim request is invalid.", 400);
  }

  // Sponsor exactly one call to our claim function, and nothing else.
  let sender: string;
  try {
    const data = Transaction.from(bytes).getData();
    const call = data.commands.length === 1 ? data.commands[0].MoveCall : undefined;
    if (
      !data.sender ||
      !call ||
      normalizeSuiAddress(call.package) !== PACKAGE_ID ||
      call.module !== "escrow" ||
      call.function !== "claim_escrow"
    ) {
      throw new Error();
    }
    sender = data.sender;
  } catch {
    return fail("The claim request is invalid.", 400);
  }

  const client = new SuiGrpcClient({ network: NETWORK, baseUrl: RPC_URL }).$extend(
    enoki({ apiKey })
  );

  try {
    // Never spend gas on a claim that is going to fail.
    const simulation = await client.simulateTransaction({ transaction: fromBase64(bytes) });
    if (simulation.FailedTransaction) {
      return fail("This link can’t be claimed. It may have been claimed, refunded or expired.", 409);
    }

    const result = await client.enoki.sponsorAndExecuteTransaction({
      transaction: bytes,
      signature,
      allowedMoveCallTargets: [claimTarget()],
      allowedAddresses: [sender, WATER_TREASURY],
    });
    if (result.FailedTransaction) {
      return fail("This link can’t be claimed. It may have been claimed, refunded or expired.", 409);
    }
    return NextResponse.json({ digest: result.Transaction.digest });
  } catch (err) {
    if (isStaleTransactionError(err)) return fail("Try the claim again.", 409, "stale");
    console.error("Claim sponsorship failed", err instanceof Error ? err.message : err);
    return fail("The claim couldn’t be completed. Try again in a moment.", 502);
  }
}
