"use client";

import { useEffect, useState } from "react";
import type { Gift } from "@/lib/gift";

interface GiftMediaProps {
  gift: Gift;
  alt: string;
  className?: string;
}

/** Shows a photo or plays a voice note. Never renders anything else. */
export function GiftMedia({ gift, alt, className }: GiftMediaProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const next = URL.createObjectURL(new Blob([gift.bytes], { type: gift.mime }));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [gift]);

  if (!url) return null;
  return gift.mime === "image/jpeg" ? (
    <img src={url} alt={alt} className={className} />
  ) : (
    <audio src={url} controls preload="metadata" aria-label={alt} className="w-full" />
  );
}
