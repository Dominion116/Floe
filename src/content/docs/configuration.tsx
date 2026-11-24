import { A, Callout, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const configuration: DocPage = {
  slug: "configuration",
  file: "configuration.tsx",
  title: "Configuration",
  description: "Every environment variable, what it controls and what happens without it.",
  sections: [
    {
      id: "env-file",
      title: "The environment file",
      body: (
        <>
          <p>
            Copy <code>.env.example</code> to <code>.env.local</code> for local work. On a host, set
            the same names in its environment settings.
          </p>
          <CodeBlock
            title=".env.local"
            lang="bash"
            code={`NEXT_PUBLIC_SUI_NETWORK="testnet"
NEXT_PUBLIC_SUI_RPC_URL="https://fullnode.testnet.sui.io:443"
NEXT_PUBLIC_FLOE_PACKAGE_ID="0x…"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="….apps.googleusercontent.com"
NEXT_PUBLIC_ENOKI_API_KEY="enoki_public_…"

# Server only
ENOKI_SECRET_KEY="enoki_private_…"
COINGECKO_API_KEY=""`}
          />
        </>
      ),
    },
    {
      id: "public-variables",
      title: "Public variables",
      keywords:
        "NEXT_PUBLIC_SUI_NETWORK NEXT_PUBLIC_SUI_RPC_URL NEXT_PUBLIC_FLOE_PACKAGE_ID NEXT_PUBLIC_GOOGLE_CLIENT_ID NEXT_PUBLIC_ENOKI_API_KEY NEXT_PUBLIC_APP_URL",
      body: (
        <>
          <p>These are compiled into the browser code, so anyone can read them.</p>
          <DataTable
            label="Public environment variables"
            head={["Variable", "Description", "If missing"]}
            mono={[0]}
            rows={[
              [
                "NEXT_PUBLIC_SUI_NETWORK",
                "mainnet, or anything else for testnet",
                "Testnet",
              ],
              [
                "NEXT_PUBLIC_SUI_RPC_URL",
                "Sui full node endpoint, with gRPC",
                "The public full node for the network",
              ],
              [
                "NEXT_PUBLIC_FLOE_PACKAGE_ID",
                "The published package ID",
                "Links can’t be created, claimed or refunded",
              ],
              [
                "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
                "Google OAuth web client ID",
                "Login and claiming are off",
              ],
              [
                "NEXT_PUBLIC_ENOKI_API_KEY",
                "Enoki public key, with zkLogin on",
                "Login and claiming are off",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "server-variables",
      title: "Server variables",
      keywords: "ENOKI_SECRET_KEY COINGECKO_API_KEY secret",
      body: (
        <>
          <DataTable
            label="Server environment variables"
            head={["Variable", "Description", "If missing"]}
            mono={[0]}
            rows={[
              [
                "ENOKI_SECRET_KEY",
                "Enoki private key, with sponsored transactions on",
                "/api/claim answers 503",
              ],
              ["COINGECKO_API_KEY", "Free CoinGecko demo key", "Prices work at a lower rate limit"],
            ]}
          />
          <Callout kind="warning" title="Keep the Enoki private key on the server">
            <p>
              Never give it a <code>NEXT_PUBLIC_</code> prefix or commit it. Anyone who has it can
              spend your gas budget.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "notes",
      title: "Notes",
      keywords: "devnet app url base url",
      body: (
        <ul>
          <li>
            <code>devnet</code> is not supported. The app treats every value except{" "}
            <code>mainnet</code> as testnet.
          </li>
          <li>
            <code>NEXT_PUBLIC_APP_URL</code> appears in <code>.env.example</code>, but the app doesn’t
            read it. Links use the address the sender is on.
          </li>
          <li>
            The GraphQL endpoint follows the network and can’t be set separately.
          </li>
          <li>
            Changing the network or package ID starts a new, empty link history in each browser. The
            old one is kept under its own name.
          </li>
        </ul>
      ),
    },
    {
      id: "in-code",
      title: "Settings in code",
      keywords: "LINK_DURATION_MS WATER_TREASURY COIN_TYPES 14 days",
      body: (
        <>
          <p>
            These are in <code>src/lib/chain/config.ts</code>.
          </p>
          <DataTable
            label="Settings in code"
            head={["Name", "Value", "Change it when"]}
            mono={[0]}
            rows={[
              ["LINK_DURATION_MS", "14 days", "You want links to last longer, up to 365 days"],
              ["COIN_TYPES", "SUI and $LOFI", "You add a token. It must use nine decimals."],
              [
                "WATER_TREASURY",
                "The contract’s treasury",
                "You publish a contract with a different address. They must match.",
              ],
            ]}
          />
          <p>
            Some interface text and the <A href="/terms">terms</A> mention 14 days, so update those
            too.
          </p>
        </>
      ),
    },
  ],
};
