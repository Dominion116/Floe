"use client";

import { usePrices } from "@/lib/usePrices";
import { approxUsd, toUsd } from "@/lib/utils";

interface LiveValueProps {
  amount: number;
  currency: "USD" | "SUI" | "LOFI";
}

/** What a token amount is worth right now. */
export function LiveValue({ amount, currency }: LiveValueProps) {
  const { rates, status } = usePrices(currency !== "USD");
  const usd = toUsd(amount, currency, rates);
  if (usd !== null) return <>{approxUsd(usd)}</>;
  return <>{status === "loading" ? "Checking price…" : "Price unavailable"}</>;
}
