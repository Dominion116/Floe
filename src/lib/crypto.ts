import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromHex, toHex } from "@mysten/sui/utils";

export interface EphemeralKeys {
  privateKeyHex: string;
  publicKeyHex: string;
  address: string;
}

/**
 * Generates an in-memory ephemeral Ed25519 keypair for locking an escrow.
 * The private key will be embedded strictly inside the URL hash fragment.
 */
export function generateEphemeralKeypair(): EphemeralKeys {
  const keypair = new Ed25519Keypair();
  const secretKey = keypair.getSecretKey();
  const publicKey = keypair.getPublicKey().toRawBytes();
  const address = keypair.toSuiAddress();

  return {
    privateKeyHex: secretKey,
    publicKeyHex: toHex(publicKey),
    address,
  };
}

/**
 * Builds the secure shareable link where the secret key is placed ONLY
 * in the window.location.hash fragment (#), guaranteeing it never touches HTTP headers or servers.
 */
export function buildClaimUrl(baseUrl: string, escrowId: string, privateKeyHex: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}/claim?id=${encodeURIComponent(escrowId)}#${privateKeyHex}`;
}

/**
 * Extracts the ephemeral secret key safely from the client-side window.location.hash.
 */
export function extractKeyFromFragment(hash: string): string | null {
  if (!hash) return null;
  // hash may start with '#'
  const clean = hash.replace(/^#/, "").trim();
  if (!clean) return null;
  return clean;
}
