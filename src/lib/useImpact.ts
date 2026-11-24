"use client";

import { useEffect, useState } from "react";
import { DECIMALS } from "./chain/config";
import type { Impact } from "./types";
import { usePrices } from "./usePrices";
import { GALLONS_PER_USD, formatCurrency } from "./utils";

// Not fromUnits, which would load the Sui SDK on the landing page.
const toAmount = (units: string) => Number(units) / 10 ** DECIMALS;

type State = { status: "loading" | "unavailable"; impact: null } | { status: "ready"; impact: Impact };

/** Everyone's roundups, ready to show. A dash means a figure isn't known, never zero. */
export function useImpact() {
  const [state, setState] = useState<State>({ status: "loading", impact: null });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/impact", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Impact responded ${res.status}`);
        setState({ status: "ready", impact: (await res.json()) as Impact });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "unavailable", impact: null });
      });
    return () => controller.abort();
  }, []);

  const { impact, status } = state;
  const { rates } = usePrices(impact !== null);
  if (!impact) {
    return { status, partial: false, claims: null, donated: "—", roundups: "—", usd: null, gallons: "—" };
  }

  const sui = toAmount(impact.donated.SUI);
  const lofi = toAmount(impact.donated.LOFI);
  const usd = rates ? sui * rates.SUI + lofi * rates.LOFI : null;
  const gallons = usd === null ? null : usd * GALLONS_PER_USD;

  return {
    status,
    /** Older claims are still being read, so every figure is a minimum. */
    partial: !impact.complete,
    claims: impact.claims,
    donated: [formatCurrency(sui, "SUI"), lofi > 0 ? formatCurrency(lofi, "LOFI") : ""]
      .filter(Boolean)
      .join(" + "),
    roundups: impact.roundups.toLocaleString("en-US"),
    usd,
    gallons:
      gallons === null
        ? "—"
        : `${gallons.toLocaleString("en-US", { maximumFractionDigits: gallons < 100 ? 1 : 0 })} gal`,
  };
}
