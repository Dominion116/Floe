import { NETWORK, PACKAGE_ID } from "./chain/config";
import type { PaymentLinkRecord } from "./types";

// Links belong to one deployed contract on one network.
const STORAGE_KEY = `floe_links_v2:${NETWORK}:${PACKAGE_ID ?? "none"}`;
/** Held simulated links, and private keys in its first version. */
const OBSOLETE_KEY = "floe_created_links_v1";

export function clearObsoleteLinks(): void {
  try {
    localStorage.removeItem(OBSOLETE_KEY);
  } catch {
    // Storage is blocked, so there is nothing to clear
  }
}

export function getStoredLinks(): PaymentLinkRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as PaymentLinkRecord[]) : [];
  } catch {
    return [];
  }
}

function write(links: PaymentLinkRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

/** Throws when storage is unavailable, so a payment is never sent without a way to refund it. */
export function saveLink(record: PaymentLinkRecord): void {
  write([record, ...getStoredLinks().filter((l) => l.digest !== record.digest)]);
}

export function updateLink(digest: string, changes: Partial<PaymentLinkRecord>): void {
  try {
    write(getStoredLinks().map((l) => (l.digest === digest ? { ...l, ...changes } : l)));
  } catch (err) {
    console.error("Failed to update link", err);
  }
}

export function removeLink(digest: string): void {
  try {
    write(getStoredLinks().filter((l) => l.digest !== digest));
  } catch (err) {
    console.error("Failed to remove link", err);
  }
}
