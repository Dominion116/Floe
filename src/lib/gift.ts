import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { MAX_BLOB_BYTES } from "./walrus";

export type GiftMime = "image/jpeg" | "audio/mp4" | "audio/webm";

export interface Gift {
  mime: GiftMime;
  bytes: Uint8Array<ArrayBuffer>;
  /** Describes a ready-made card. Only for the sender's screen, and never sealed. */
  cardAlt?: string;
}

/** What to call it in a sentence. */
export const giftNoun = (gift: Gift) =>
  gift.cardAlt ? "yeti card" : gift.mime === "image/jpeg" ? "photo" : "voice note";

/** Position is the type byte. Append only. */
const MIMES: GiftMime[] = ["image/jpeg", "audio/mp4", "audio/webm"];

const VERSION = 1;
const HEADER = 2;
const IV = 12;
const TAG = 16;
export const MAX_GIFT_BYTES = MAX_BLOB_BYTES - IV - TAG - HEADER;

const matches = (bytes: Uint8Array, offset: number, expected: number[]) =>
  expected.every((byte, i) => bytes[offset + i] === byte);

/** What the bytes really are. Nothing else is ever stored or shown. */
export function giftMime(bytes: Uint8Array): GiftMime | null {
  if (matches(bytes, 0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (matches(bytes, 4, [0x66, 0x74, 0x79, 0x70])) return "audio/mp4"; // "ftyp"
  if (matches(bytes, 0, [0x1a, 0x45, 0xdf, 0xa3])) return "audio/webm";
  return null;
}

/** Comes from the link's own key, so the link carries no second secret. */
async function giftKey(privateKey: string): Promise<CryptoKey> {
  const { secretKey } = decodeSuiPrivateKey(privateKey);
  const material = await crypto.subtle.importKey("raw", new Uint8Array(secretKey), "HKDF", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(),
      info: new TextEncoder().encode("floe-gift-v1"),
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** IV, then the encrypted version, type and content. */
export async function sealGift(
  gift: Gift,
  privateKey: string
): Promise<Uint8Array<ArrayBuffer>> {
  if (gift.bytes.length > MAX_GIFT_BYTES) throw new Error("The gift is too large");
  if (giftMime(gift.bytes) !== gift.mime) throw new Error("The gift isn’t what it claims to be");

  const plain = new Uint8Array(HEADER + gift.bytes.length);
  plain.set([VERSION, MIMES.indexOf(gift.mime)]);
  plain.set(gift.bytes, HEADER);

  const iv = crypto.getRandomValues(new Uint8Array(IV));
  const sealed = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await giftKey(privateKey),
    plain
  );
  const blob = new Uint8Array(IV + sealed.byteLength);
  blob.set(iv);
  blob.set(new Uint8Array(sealed), IV);
  return blob;
}

/** Throws unless this exact content was sealed with this link's key. */
export async function openGift(blob: Uint8Array<ArrayBuffer>, privateKey: string): Promise<Gift> {
  const plain = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: blob.subarray(0, IV) },
      await giftKey(privateKey),
      blob.subarray(IV)
    )
  );
  const mime = MIMES[plain[1]];
  const bytes = plain.slice(HEADER);
  if (plain[0] !== VERSION || !mime || giftMime(bytes) !== mime) {
    throw new Error("Unknown kind of gift");
  }
  return { mime, bytes };
}
