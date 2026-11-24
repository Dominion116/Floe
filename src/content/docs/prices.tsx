import { A, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";
import { COIN_TYPES } from "@/lib/chain/config";

export const prices: DocPage = {
  slug: "prices",
  file: "prices.tsx",
  title: "Prices and tokens",
  description: "Links hold tokens, not dollars. Here is how Floe converts between them.",
  sections: [
    {
      id: "tokens",
      title: "Supported tokens",
      keywords: "sui lofi coin type decimals",
      body: (
        <>
          <DataTable
            label="Supported tokens"
            head={["Token", "Networks", "Coin type"]}
            mono={[2]}
            rows={[
              ["SUI", "Testnet and mainnet", COIN_TYPES.SUI],
              ["$LOFI", "Mainnet only", COIN_TYPES.LOFI],
            ]}
          />
          <p>
            Both use nine decimals. The contract accepts any coin type, but the app reads only escrows
            that hold these two.
          </p>
        </>
      ),
    },
    {
      id: "dollar-links",
      title: "Dollar links",
      keywords: "usd value changes conversion slippage",
      body: (
        <>
          <p>
            When a sender types dollars, Floe divides by the live SUI price and rounds to four decimal
            places. The escrow holds that amount of SUI, so the recipient gets the same number of SUI
            whenever they claim. Its value in dollars can rise or fall in the meantime.
          </p>
          <p>
            The claim page shows the dollar value at the live price, with the exact token amount
            beneath it.
          </p>
        </>
      ),
    },
    {
      id: "sources",
      title: "Where prices come from",
      keywords: "coingecko dexscreener oracle",
      body: (
        <>
          <p>
            Floe’s server fetches prices, so your browser doesn’t contact these services. It tries
            CoinGecko first. If either price is missing or more than 15 minutes old, it fills the gap
            from the deepest pool on DEX Screener.
          </p>
          <p>
            Prices are for display and conversion only. The contract doesn’t use them.
          </p>
        </>
      ),
    },
    {
      id: "freshness",
      title: "How fresh they are",
      keywords: "cache polling interval outage",
      body: (
        <>
          <DataTable
            label="Price timing"
            head={["Step", "Limit"]}
            rows={[
              ["Wait for each source", "5 seconds"],
              ["Server cache", "30 seconds"],
              ["Browser refresh, while a price is on screen", "Every 30 seconds"],
              ["Last good price kept during an outage", "2 minutes"],
            ]}
          />
          <p>
            After that, Floe shows prices as unavailable and won’t create a link. It never substitutes
            an old number. The response format is in the{" "}
            <A href="/docs/http-api#prices">HTTP API</A>.
          </p>
        </>
      ),
    },
  ],
};
