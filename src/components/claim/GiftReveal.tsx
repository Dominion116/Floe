"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift as GiftIcon, Loader2 } from "lucide-react";
import { GiftMedia } from "@/components/ui/GiftMedia";
import { openGift, type Gift } from "@/lib/gift";
import { BlobMissingError, readBlob } from "@/lib/walrus";

interface GiftRevealProps {
  giftId: string;
  /** The link's key, which also opens the gift. */
  privateKey: string;
}

type State =
  | { status: "closed" | "opening" | "failed" | "gone" }
  | { status: "open"; gift: Gift };

/** Downloads nothing until it is opened. */
export function GiftReveal({ giftId, privateKey }: GiftRevealProps) {
  const [state, setState] = useState<State>({ status: "closed" });
  const [saveUrl, setSaveUrl] = useState<string | null>(null);
  const gift = state.status === "open" ? state.gift : null;

  useEffect(() => {
    if (!gift) return;
    const url = URL.createObjectURL(new Blob([gift.bytes], { type: gift.mime }));
    setSaveUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [gift]);

  const handleOpen = async () => {
    setState({ status: "opening" });
    let blob: Uint8Array<ArrayBuffer>;
    try {
      blob = await readBlob(giftId);
    } catch (err) {
      setState({ status: err instanceof BlobMissingError ? "gone" : "failed" });
      return;
    }
    try {
      setState({ status: "open", gift: await openGift(blob, privateKey) });
    } catch {
      setState({ status: "gone" });
    }
  };

  if (gift) {
    const isPhoto = gift.mime === "image/jpeg";
    const extension = { "image/jpeg": "jpg", "audio/mp4": "m4a", "audio/webm": "webm" }[gift.mime];
    return (
      <motion.figure
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3 rounded-3xl bg-frost-light p-4 text-center"
      >
        <GiftMedia
          gift={gift}
          alt={isPhoto ? "The photo you were sent" : "The voice note you were sent"}
          className="max-h-[60vh] w-full rounded-2xl object-contain"
        />
        <figcaption className="type-help">
          From whoever made the link. Floe can’t see or check it.
        </figcaption>
        {saveUrl && (
          <a
            href={saveUrl}
            download={`floe-gift.${extension}`}
            className="btn btn-sm btn-secondary w-full"
          >
            Save {isPhoto ? "photo" : "voice note"}
          </a>
        )}
      </motion.figure>
    );
  }

  if (state.status === "gone") {
    return (
      <p role="status" className="well px-4 py-3 text-center text-sm text-ink-muted">
        The gift that came with this link is no longer available.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={state.status === "opening"}
        aria-busy={state.status === "opening"}
        onClick={() => void handleOpen()}
        className="btn w-full bg-frost text-ink hover:bg-frost-dark"
      >
        {state.status === "opening" ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <GiftIcon aria-hidden="true" />
        )}
        <span>{state.status === "opening" ? "Opening…" : "Open your gift"}</span>
      </button>
      {state.status === "failed" && (
        <p role="alert" className="text-center text-sm text-danger">
          The gift couldn’t be loaded. Check your connection, then try again.
        </p>
      )}
    </div>
  );
}
