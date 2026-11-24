import { A, Callout, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const quickstart: DocPage = {
  slug: "quickstart",
  file: "quickstart.tsx",
  title: "Quickstart",
  description: "Run Floe on your own machine, from a fresh clone to a working claim on testnet.",
  sections: [
    {
      id: "requirements",
      title: "What you need",
      body: (
        <ul>
          <li>
            <strong>Node.js</strong> 18.18 or later
          </li>
          <li>
            <strong>npm</strong> 9 or later. The project uses npm only, so don’t use Yarn, pnpm or
            Bun.
          </li>
          <li>
            <strong>Sui CLI</strong>, if you want to test or publish the contract
          </li>
          <li>
            A Sui wallet with testnet SUI, if you want to create links
          </li>
        </ul>
      ),
    },
    {
      id: "run",
      title: "Run the app",
      keywords: "install clone npm run dev localhost 3000",
      body: (
        <>
          <CodeBlock
            title="Terminal"
            lang="bash"
            code={`git clone https://github.com/Dominion116/Floe.git
cd Floe
npm install
cp .env.example .env.local
npm run dev`}
          />
          <p>
            Open <code>http://localhost:3000</code>. The landing page, the claim demo and live prices
            work straight away.
          </p>
        </>
      ),
    },
    {
      id: "what-works-without-keys",
      title: "What works before you add keys",
      body: (
        <>
          <p>
            Floe turns features off when their settings are missing, instead of failing part way
            through a payment.
          </p>
          <DataTable
            label="Features and the settings they need"
            head={["Feature", "Needs"]}
            rows={[
              ["Landing page, docs and claim demo", "Nothing"],
              ["Live prices", "Nothing. A CoinGecko key only raises the rate limit."],
              ["Create and refund links", <code key="p">NEXT_PUBLIC_FLOE_PACKAGE_ID</code>],
              [
                "Claim with Google or a wallet",
                <span key="c">
                  The package ID, <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>,{" "}
                  <code>NEXT_PUBLIC_ENOKI_API_KEY</code> and <code>ENOKI_SECRET_KEY</code>
                </span>,
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "full-setup",
      title: "Set up real payments",
      body: (
        <>
          <ol>
            <li>
              <A href="/docs/deploy#publish">Publish the contract</A> to testnet and copy its package
              ID.
            </li>
            <li>
              <A href="/docs/deploy#google">Create a Google OAuth client</A> with{" "}
              <code>http://localhost:3000/auth</code> as a redirect URI.
            </li>
            <li>
              <A href="/docs/deploy#enoki">Set up Enoki</A> with one public and one private API key.
            </li>
            <li>
              Fill in <code>.env.local</code> using the{" "}
              <A href="/docs/configuration">configuration reference</A>, then restart the server.
            </li>
          </ol>
          <Callout title="Restart after changing settings">
            <p>
              Variables that start with <code>NEXT_PUBLIC_</code> are written into the browser code
              when the app compiles, so a running server won’t pick them up.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "check",
      title: "Check your changes",
      keywords: "tests typecheck tsc move test",
      body: (
        <>
          <CodeBlock
            title="Terminal"
            lang="bash"
            code={`# Types, from the project root
npx tsc --noEmit

# Contract tests
cd move
sui move test`}
          />
        </>
      ),
    },
    {
      id: "project-layout",
      title: "Project layout",
      body: (
        <DataTable
          label="Project layout"
          head={["Path", "Contents"]}
          mono={[0]}
          rows={[
            ["move/sources", "The floe::escrow contract"],
            ["move/tests", "Contract unit tests"],
            ["src/app", "Pages and API routes"],
            ["src/components", "Interface, grouped by feature"],
            ["src/content", "These docs and the legal pages"],
            ["src/lib/chain", "Network settings, reads and transaction builders"],
            ["src/lib/crypto.ts", "Link keys and link format"],
            ["src/lib/storage.ts", "The sender’s saved history"],
            ["src/lib/rates.ts", "Server-side live prices"],
          ]}
        />
      ),
    },
  ],
};
