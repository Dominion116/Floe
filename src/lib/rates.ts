import type { Rates } from "./types";

// Server only. Used by /api/prices.

const SUI_TYPE = "0x2::sui::SUI";
const LOFI_TYPE =
  "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI";

const COINGECKO_SUI = "sui";
const COINGECKO_LOFI = "lofi-2";

const TIMEOUT_MS = 5_000;
const CACHE_MS = 30_000;
/** A quote older than this is not live, so the next source is tried. */
const MAX_QUOTE_AGE_MS = 15 * 60_000;
/** How long the last good price survives an outage. */
const MAX_OUTAGE_MS = 2 * 60_000;

type Quotes = Partial<Rates>;

const isPrice = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

async function getJson(url: string, headers?: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: "application/json", ...headers },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Price source responded ${res.status}`);
  return res.json();
}

async function fromCoinGecko(): Promise<Quotes> {
  const key = process.env.COINGECKO_API_KEY;
  const data = (await getJson(
    `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_SUI},${COINGECKO_LOFI}&vs_currencies=usd&include_last_updated_at=true&precision=full`,
    key ? { "x-cg-demo-api-key": key } : undefined
  )) as Record<string, { usd?: number; last_updated_at?: number } | undefined>;

  const read = (id: string): number | undefined => {
    const quote = data[id];
    if (!isPrice(quote?.usd) || !quote.last_updated_at) return undefined;
    if (Date.now() - quote.last_updated_at * 1000 > MAX_QUOTE_AGE_MS) return undefined;
    return quote.usd;
  };
  return { SUI: read(COINGECKO_SUI), LOFI: read(COINGECKO_LOFI) };
}

async function fromDexScreener(): Promise<Quotes> {
  const pairs = (await getJson(
    `https://api.dexscreener.com/tokens/v1/sui/${SUI_TYPE},${LOFI_TYPE}`
  )) as {
    baseToken?: { address?: string };
    priceUsd?: string;
    liquidity?: { usd?: number };
  }[];
  if (!Array.isArray(pairs)) throw new Error("Unexpected price response");

  // The deepest pool is the hardest to move, so it sets the price.
  const read = (coinType: string): number | undefined => {
    const best = pairs
      .filter((p) => p.baseToken?.address === coinType)
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
    const price = Number(best?.priceUsd);
    return isPrice(price) ? price : undefined;
  };
  return { SUI: read(SUI_TYPE), LOFI: read(LOFI_TYPE) };
}

async function loadRates(): Promise<Rates> {
  let quotes: Quotes = {};
  for (const source of [fromCoinGecko, fromDexScreener]) {
    try {
      const next = await source();
      quotes = { SUI: quotes.SUI ?? next.SUI, LOFI: quotes.LOFI ?? next.LOFI };
    } catch (err) {
      console.warn("Price source failed", err instanceof Error ? err.message : err);
    }
    if (quotes.SUI && quotes.LOFI) return { SUI: quotes.SUI, LOFI: quotes.LOFI };
  }
  throw new Error("No live price available");
}

let cached: { rates: Rates; at: number } | null = null;
let inflight: Promise<Rates> | null = null;

/** Live dollar prices, shared between requests for up to 30 seconds. */
export async function getRates(): Promise<Rates> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rates;

  inflight ??= loadRates().finally(() => {
    inflight = null;
  });

  try {
    const rates = await inflight;
    cached = { rates, at: Date.now() };
    return rates;
  } catch (err) {
    if (cached && Date.now() - cached.at < MAX_OUTAGE_MS) return cached.rates;
    throw err;
  }
}
