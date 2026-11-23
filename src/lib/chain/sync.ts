import { getStoredLinks, removeLink, updateLink } from "@/lib/storage";
import type { PaymentLinkRecord } from "@/lib/types";
import { readClosed, readCreated, readEscrows } from "./escrow";

/** A signed payment that still isn't on chain after this long was never sent. */
const ABANDONED_MS = 60 * 60 * 1000;

async function settleCreating(link: PaymentLinkRecord): Promise<void> {
  const result = await readCreated(link.digest);
  if (result.status === "created") {
    updateLink(link.digest, { escrowId: result.escrowId, status: "pending" });
  } else if (
    result.status === "failed" ||
    (result.status === "missing" && Date.now() - link.createdAt > ABANDONED_MS)
  ) {
    removeLink(link.digest);
  }
}

async function settleClosed(link: PaymentLinkRecord, escrowId: string): Promise<void> {
  const closed = await readClosed(escrowId);
  if (!closed) return; // Not indexed yet. The next sync picks it up.
  updateLink(
    link.digest,
    closed.kind === "claimed"
      ? { status: "claimed", claimedBy: closed.recipient, closedAt: closed.at ?? undefined }
      : { status: "reclaimed", closedAt: closed.at ?? undefined }
  );
}

/** Brings saved links up to date with the chain. */
export async function syncLinks(): Promise<PaymentLinkRecord[]> {
  await Promise.all(
    getStoredLinks()
      .filter((l) => l.status === "creating")
      .map(settleCreating)
  );

  const open = getStoredLinks().filter(
    (l): l is PaymentLinkRecord & { escrowId: string } =>
      l.escrowId !== null && (l.status === "pending" || l.status === "expired")
  );
  const escrows = await readEscrows(open.map((l) => l.escrowId));

  await Promise.all(
    open.map(async (link) => {
      const escrow = escrows.get(link.escrowId);
      if (escrow === undefined) return;
      if (escrow === null) return settleClosed(link, link.escrowId);
      const status = Date.now() > escrow.expiresAt ? "expired" : "pending";
      if (status !== link.status || escrow.expiresAt !== link.expiresAt) {
        updateLink(link.digest, { status, expiresAt: escrow.expiresAt });
      }
    })
  );
  return getStoredLinks();
}
