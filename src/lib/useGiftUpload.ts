"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateEphemeralKeypair, type EphemeralKeys } from "./crypto";
import { sealGift, type Gift } from "./gift";
import { storeBlob } from "./walrus";

type Upload =
  | { status: "idle" }
  | { status: "uploading" | "failed"; gift: Gift }
  /** The payment must use these keys, because the gift is sealed with them. */
  | { status: "ready"; gift: Gift; keys: EphemeralKeys; blobId: string };

/** Seals a gift with a new link key and stores it. The key stays in memory. */
export function useGiftUpload() {
  const [upload, setUpload] = useState<Upload>({ status: "idle" });
  const current = useRef<{ gift: Gift; controller: AbortController } | null>(null);

  const clear = useCallback(() => {
    current.current?.controller.abort();
    current.current = null;
    setUpload({ status: "idle" });
  }, []);

  /** Does nothing if this gift is already stored or on its way. */
  const start = useCallback(async (gift: Gift) => {
    if (current.current?.gift === gift) return;
    current.current?.controller.abort();

    const job = { gift, controller: new AbortController() };
    current.current = job;
    setUpload({ status: "uploading", gift });
    try {
      const keys = generateEphemeralKeypair();
      const blob = await sealGift(gift, keys.privateKey);
      const blobId = await storeBlob(blob, job.controller.signal);
      if (current.current === job) setUpload({ status: "ready", gift, keys, blobId });
    } catch {
      if (current.current !== job) return;
      current.current = null; // So it can be started again
      setUpload({ status: "failed", gift });
    }
  }, []);

  useEffect(() => () => current.current?.controller.abort(), []);

  return { upload, start, clear };
}
