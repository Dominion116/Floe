"use client";

import { useSyncExternalStore } from "react";
import type { Rates } from "./types";

const POLL_MS = 30_000;
/** Past this, a price is no longer live and is dropped rather than shown. */
const MAX_AGE_MS = 2 * 60_000;

interface PriceState {
  rates: Rates | null;
  status: "loading" | "live" | "unavailable";
}

const INITIAL: PriceState = { rates: null, status: "loading" };

let state = INITIAL;
let fetchedAt = 0;
let timer: ReturnType<typeof setInterval> | undefined;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: PriceState) {
  state = next;
  listeners.forEach((notify) => notify());
}

async function load() {
  try {
    const res = await fetch("/api/prices", { cache: "no-store" });
    if (!res.ok) throw new Error(`Prices responded ${res.status}`);
    const data = (await res.json()) as Partial<Rates>;
    if (!(Number(data.SUI) > 0) || !(Number(data.LOFI) > 0)) throw new Error("Invalid prices");
    fetchedAt = Date.now();
    setState({ rates: { SUI: Number(data.SUI), LOFI: Number(data.LOFI) }, status: "live" });
  } catch {
    if (Date.now() - fetchedAt > MAX_AGE_MS) setState({ rates: null, status: "unavailable" });
  }
}

export function refreshPrices(): Promise<void> {
  inflight ??= load().finally(() => {
    inflight = null;
  });
  return inflight;
}

function wake() {
  if (document.visibilityState !== "visible") return;
  // A tab that slept must not show the price it fell asleep with.
  if (state.rates && Date.now() - fetchedAt > MAX_AGE_MS) setState(INITIAL);
  void refreshPrices();
}

// Polls only while something on screen needs a price.
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    wake();
    timer = setInterval(wake, POLL_MS);
    document.addEventListener("visibilitychange", wake);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", wake);
    }
  };
}

const idle = () => () => {};

/** Live SUI and $LOFI prices in dollars. `rates` is null until they are known. */
export function usePrices(enabled = true): PriceState {
  return useSyncExternalStore(
    enabled ? subscribe : idle,
    () => state,
    () => INITIAL
  );
}
