import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { toHex } from "@mysten/sui/utils";

export interface EphemeralKeys {
  privateKey: string;
  publicKeyHex: string;
}

export const MAX_NOTE_LENGTH = 60;

/**
 * Generates an in-memory ephemeral Ed25519 keypair for locking an escrow.
 * The private key is embedded strictly inside the URL hash fragment.
 */
export function generateEphemeralKeypair(): EphemeralKeys {
  const keypair = new Ed25519Keypair();
  return {
    privateKey: keypair.getSecretKey(),
    publicKeyHex: toHex(keypair.getPublicKey().toRawBytes()),
  };
}

/**
 * Builds the shareable link. The key and the note sit in the hash fragment (#),
 * which browsers never send to a server.
 */
export function buildClaimUrl(
  baseUrl: string,
  escrowId: string,
  privateKey: string,
  note = ""
): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const fragment = new URLSearchParams({ k: privateKey });
  if (note) fragment.set("n", note);
  return `${cleanBase}/claim?id=${encodeURIComponent(escrowId)}#${fragment}`;
}

/** Reads the key and note from window.location.hash, in the browser only. */
export function parseClaimFragment(hash: string): { privateKey: string | null; note: string } {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return {
    privateKey: params.get("k"),
    note: (params.get("n") ?? "").slice(0, MAX_NOTE_LENGTH),
  };
}
