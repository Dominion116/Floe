import { NETWORK } from "./chain/config";

const TESTNET = NETWORK === "testnet";

/**
 * Public testnet publishers from docs.wal.app/operators.json, tried in this order. They run out
 * of WAL or go down now and then, so there is always another to try.
 */
const TESTNET_PUBLISHERS = [
  "https://walrus-testnet-publisher.nami.cloud",
  "https://walrus-testnet-publisher.nodes.guru",
  "https://walrus-testnet-publisher.stakecraft.com",
  "https://walrus-publisher-testnet.staking4all.org",
];
const TESTNET_AGGREGATORS = ["https://aggregator.walrus-testnet.walrus.space"];

/** A comma-separated setting, or the public testnet services. */
const endpoints = (value: string | undefined, testnet: string[]): string[] => {
  const set = (value ?? "").split(",").map((url) => url.trim().replace(/\/+$/, "")).filter(Boolean);
  return set.length > 0 ? set : TESTNET ? testnet : [];
};

const PUBLISHERS = endpoints(process.env.NEXT_PUBLIC_WALRUS_PUBLISHER, TESTNET_PUBLISHERS);
const AGGREGATORS = endpoints(process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR, TESTNET_AGGREGATORS);

/** Walrus has no public mainnet publisher, so there gifts need both settings. */
export const GIFTS_ENABLED = PUBLISHERS.length > 0 && AGGREGATORS.length > 0;

/** Outlasts a 14-day link. Epochs last a day on testnet and two weeks on mainnet. */
const EPOCHS = TESTNET ? 20 : 3;
const UPLOAD_TIMEOUT_MS = 40_000;
const DOWNLOAD_TIMEOUT_MS = 30_000;

/** Several publishers refuse more than this. */
export const MAX_BLOB_BYTES = 1_000_000;

const BLOB_ID = /^[A-Za-z0-9_-]{43}$/;
export const isBlobId = (value: string | null): value is string => !!value && BLOB_ID.test(value);

/** The blob isn't there, so trying again won't help. */
export class BlobMissingError extends Error {}

async function storeAt(
  publisher: string,
  blob: Uint8Array<ArrayBuffer>,
  signal?: AbortSignal
): Promise<string> {
  // Not AbortSignal.any, which older iPhones don't have.
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, UPLOAD_TIMEOUT_MS);
  signal?.addEventListener("abort", abort);
  try {
    // Permanent, because a publisher can delete the default kind before it expires.
    const res = await fetch(`${publisher}/v1/blobs?epochs=${EPOCHS}&permanent=true`, {
      method: "PUT",
      body: blob,
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Walrus responded ${res.status}`);

    const body = (await res.json()) as {
      newlyCreated?: { blobObject?: { blobId?: string } };
      alreadyCertified?: { blobId?: string };
    };
    const id = body.newlyCreated?.blobObject?.blobId ?? body.alreadyCertified?.blobId ?? null;
    if (!isBlobId(id)) throw new Error("Unexpected response from Walrus");
    return id;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

/** Anyone can read what is stored, so it must be encrypted first. */
export async function storeBlob(
  blob: Uint8Array<ArrayBuffer>,
  signal?: AbortSignal
): Promise<string> {
  if (blob.length > MAX_BLOB_BYTES) throw new Error("Too large to store");

  let lastError: unknown = new Error("Walrus isn’t configured");
  for (const publisher of PUBLISHERS) {
    signal?.throwIfAborted();
    try {
      return await storeAt(publisher, blob, signal);
    } catch (err) {
      lastError = err;
    }
  }
  signal?.throwIfAborted();
  throw lastError;
}

/** Stops reading once there is more than a gift could hold. */
async function readCapped(body: ReadableStream<Uint8Array>): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BLOB_BYTES) {
      await reader.cancel();
      throw new BlobMissingError("Larger than any gift");
    }
    chunks.push(value);
  }

  const blob = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    blob.set(chunk, offset);
    offset += chunk.length;
  }
  return blob;
}

export async function readBlob(id: string): Promise<Uint8Array<ArrayBuffer>> {
  if (!isBlobId(id)) throw new BlobMissingError("No such blob");

  let lastError: unknown = new BlobMissingError("Walrus isn’t configured");
  for (const aggregator of AGGREGATORS) {
    try {
      const res = await fetch(`${aggregator}/v1/blobs/${id}`, {
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });
      if (res.status === 404 || res.status === 400) throw new BlobMissingError("No such blob");
      if (!res.ok || !res.body) throw new Error(`Walrus responded ${res.status}`);
      return await readCapped(res.body);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
