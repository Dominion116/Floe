import { MAX_GIFT_BYTES, giftMime, type Gift } from "./gift";

// Browser only.

/** Shown to the person as it is. */
export class MediaError extends Error {}

const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

/** Tried in order until the photo fits. */
const SIZES = [
  { edge: 1280, quality: 0.82 },
  { edge: 1280, quality: 0.65 },
  { edge: 960, quality: 0.6 },
];

async function decode(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch {
    throw new MediaError("This browser can’t open that photo. Try a JPEG or PNG.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Redraws the photo, which shrinks it and leaves out its location and other hidden details. */
export async function preparePhoto(file: File): Promise<Gift> {
  if (file.size > MAX_SOURCE_BYTES) throw new MediaError("That photo is too large. Choose one under 30 MB.");
  const image = await decode(file);

  for (const { edge, quality } of SIZES) {
    const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) break;
    // JPEG has no transparency
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) continue;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes.length <= MAX_GIFT_BYTES && giftMime(bytes) === "image/jpeg") {
      return { mime: "image/jpeg", bytes };
    }
  }
  throw new MediaError("That photo couldn’t be prepared. Try another one.");
}

export const MAX_VOICE_SECONDS = 30;

/** AAC first, because every phone can play it. */
const VOICE_TYPES = [
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
];

export const canRecord = () =>
  typeof MediaRecorder !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  VOICE_TYPES.some((type) => MediaRecorder.isTypeSupported(type));

export function createRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = VOICE_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  return new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 64_000 });
}

export async function prepareVoice(chunks: Blob[]): Promise<Gift> {
  const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
  const mime = giftMime(bytes);
  if (!mime || mime === "image/jpeg") {
    throw new MediaError("Nothing was recorded. Check the microphone and try again.");
  }
  if (bytes.length > MAX_GIFT_BYTES) {
    throw new MediaError("That recording is too large. Try a shorter one.");
  }
  return { mime, bytes };
}

export function microphoneError(err: unknown): string {
  const name = err instanceof Error ? err.name : "";
  if (name === "NotAllowedError") return "Allow the microphone for this site, then try again.";
  if (name === "NotFoundError") return "No microphone was found.";
  return "The microphone couldn’t be started. Another app may be using it.";
}
