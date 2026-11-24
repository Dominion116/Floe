import { A, CodeBlock } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";
import { ISSUES_URL } from "@/lib/site";

export const troubleshooting: DocPage = {
  slug: "troubleshooting",
  file: "troubleshooting.tsx",
  title: "Troubleshooting",
  description: "Common problems, what causes them and how to fix each one.",
  sections: [
    {
      id: "using-floe",
      title: "Using Floe",
      body: (
        <p>
          Messages on the claim page are explained in{" "}
          <A href="/docs/claim#when-a-link-does-not-open">When a link doesn’t open</A>, and messages
          while sending in <A href="/docs/send#if-something-goes-wrong">Send a link</A>.
        </p>
      ),
      children: [
        {
          id: "link-incomplete",
          title: "The link says it is incomplete",
          keywords: "fragment missing hash dropped shortener",
          body: (
            <p>
              The part after the <code>#</code> was lost, usually to a link shortener or a partial
              copy. Send the original link again, or use the QR code. If the sender no longer has it,
              they should refund it and create a new one.
            </p>
          ),
        },
        {
          id: "lost-link",
          title: "I closed the window before saving the link",
          keywords: "lost link recover",
          body: (
            <p>
              The key is gone, but the money isn’t. <A href="/docs/refunds#refund">Refund it</A> from
              your dashboard.
            </p>
          ),
        },
        {
          id: "empty-dashboard",
          title: "My dashboard is empty",
          keywords: "history missing other device",
          body: (
            <p>
              History stays in the browser that created the links. Open that browser, outside private
              mode, at the same site address. If its data was cleared, follow{" "}
              <A href="/docs/refunds#refund-without-the-dashboard">Refund without the dashboard</A>.
            </p>
          ),
        },
        {
          id: "wrong-wallet",
          title: "Only the wallet that created this link can refund it",
          body: (
            <p>
              Choose <strong>Change</strong> and connect the account shown next to “Created by”. If
              your wallet has several accounts, switch to that one first.
            </p>
          ),
        },
        {
          id: "no-wallet-found",
          title: "No Sui wallet found",
          keywords: "slush install extension",
          body: (
            <p>
              Install a Sui wallet in this browser and reload the page. In-app browsers usually can’t
              use wallet extensions.
            </p>
          ),
        },
        {
          id: "statuses-old",
          title: "Statuses may be out of date",
          keywords: "unable to reach sui",
          body: (
            <p>
              Sui couldn’t be reached, so the dashboard shows the last known state. Choose{" "}
              <strong>Try again</strong>. A claim that has just happened can also take a moment to
              appear.
            </p>
          ),
        },
      ],
    },
    {
      id: "running-floe",
      title: "Running Floe",
      body: <p>Problems you may meet when you deploy or develop the app.</p>,
      children: [
        {
          id: "redirect-mismatch",
          title: "Google says redirect_uri_mismatch",
          keywords: "error 400 oauth",
          body: (
            <>
              <p>
                Add the exact address of your <code>/auth</code> page to the OAuth client. The scheme,
                host and port must match, and preview deployments have addresses of their own.
              </p>
            </>
          ),
        },
        {
          id: "google-disabled",
          title: "Continue with Google is disabled",
          body: (
            <p>
              Set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and <code>NEXT_PUBLIC_ENOKI_API_KEY</code>,
              then restart or redeploy.
            </p>
          ),
        },
        {
          id: "not-configured",
          title: "The Floe contract hasn’t been connected",
          keywords: "sending isn't set up package id",
          body: (
            <p>
              <code>NEXT_PUBLIC_FLOE_PACKAGE_ID</code> is missing or is not a valid Sui address. A zero
              address counts as missing.
            </p>
          ),
        },
        {
          id: "claims-502",
          title: "Claims fail with 502",
          keywords: "sponsorship failed insufficient sponsor balance enoki",
          body: (
            <>
              <p>
                The server log has a line starting with <code>Claim sponsorship failed</code>. Check
                that:
              </p>
              <ul>
                <li>
                  <code>ENOKI_SECRET_KEY</code> is a private key with sponsorship enabled on the right
                  network
                </li>
                <li>
                  The call target for <code>claim_escrow</code> is allowed for the current package ID
                </li>
                <li>The gas budget in Enoki isn’t used up</li>
              </ul>
            </>
          ),
        },
        {
          id: "claims-409",
          title: "Claims fail with 409",
          body: (
            <p>
              Without a code, the escrow was already claimed or refunded, or has expired. With the
              code <code>stale</code>, rebuild the transaction and ask for a new signature.
            </p>
          ),
        },
        {
          id: "prices-503",
          title: "Prices are unavailable",
          keywords: "coingecko rate limit 503",
          body: (
            <p>
              Both price sources failed. Shared hosts often reach CoinGecko’s limit, and a free{" "}
              <code>COINGECKO_API_KEY</code> raises it.
            </p>
          ),
        },
        {
          id: "chunk-load-error",
          title: "ChunkLoadError in development",
          keywords: "next dev two servers .next",
          body: (
            <>
              <p>
                Two development servers are probably sharing one <code>.next</code> folder. Stop both,
                then start one.
              </p>
              <CodeBlock title="Terminal" lang="bash" code={`npm run dev`} />
            </>
          ),
        },
      ],
    },
    {
      id: "get-help",
      title: "Get help",
      body: (
        <p>
          Open an issue on <A href={ISSUES_URL}>GitHub</A> with what you did, what you expected and
          the transaction digest if there is one. Never paste a claim link. Anyone who reads it can
          take the money.
        </p>
      ),
    },
  ],
};
