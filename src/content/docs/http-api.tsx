import { A, Callout, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const httpApi: DocPage = {
  slug: "http-api",
  file: "http-api.tsx",
  title: "HTTP API",
  description: "The routes the app serves: claim sponsorship, live prices and water totals.",
  sections: [
    {
      id: "before-you-use",
      title: "Before you use it",
      body: (
        <Callout title="Built for the Floe app">
          <p>
            These routes have no API keys, no versioning and no CORS headers. They can change with the
            app, so run your own deployment if you need them to stay the same.
          </p>
        </Callout>
      ),
    },
    {
      id: "claim",
      title: "POST /api/claim",
      keywords: "sponsor gas bytes signature digest stale",
      body: (
        <p>
          Pays the gas for one claim and runs it. The caller builds and signs the transaction first,
          with Enoki’s sponsor set as the gas owner.
        </p>
      ),
      children: [
        {
          id: "claim-request",
          title: "Request",
          body: (
            <>
              <DataTable
                label="POST /api/claim body"
                head={["Field", "Type", "Description"]}
                mono={[0, 1]}
                rows={[
                  ["bytes", "string", "The built transaction in base64, up to 20,000 characters"],
                  ["signature", "string", "The recipient’s signature, up to 20,000 characters"],
                ]}
              />
              <CodeBlock
                title="Request body"
                lang="json"
                code={`{
  "bytes": "AAACAQ…",
  "signature": "BQNN…"
}`}
              />
              <p>Never send the link’s private key. The server has no use for it.</p>
            </>
          ),
        },
        {
          id: "claim-checks",
          title: "Checks, in order",
          body: (
            <ol>
              <li>Claiming is configured on this deployment.</li>
              <li>Both fields are strings within the length limit.</li>
              <li>
                The transaction has a sender and exactly one command, a call to this package’s{" "}
                <code>escrow::claim_escrow</code>.
              </li>
              <li>A simulation succeeds.</li>
              <li>Enoki accepts it, with the call target and receiving addresses restricted.</li>
            </ol>
          ),
        },
        {
          id: "claim-response",
          title: "Responses",
          keywords: "400 409 502 503 status errors",
          body: (
            <>
              <CodeBlock
                title="200 OK"
                lang="json"
                code={`{ "digest": "9vT3…" }`}
              />
              <CodeBlock
                title="409 Conflict"
                lang="json"
                code={`{ "error": "Try the claim again.", "code": "stale" }`}
              />
              <DataTable
                label="POST /api/claim statuses"
                head={["Status", "Meaning", "Retry"]}
                mono={[0]}
                rows={[
                  ["200", "The claim ran. The digest identifies the transaction.", "No"],
                  ["400", "The body or the transaction is not a valid claim.", "No"],
                  ["409", "With code stale: the sponsor’s details changed.", "Rebuild and sign again"],
                  ["409", "Without a code: the escrow was claimed, refunded or has expired.", "No"],
                  ["502", "Sui or Enoki failed, or the sponsor is out of funds.", "Yes, after a moment"],
                  ["503", "Claiming isn’t set up on this deployment.", "No"],
                ]}
              />
            </>
          ),
        },
        {
          id: "claim-example",
          title: "Example",
          body: (
            <>
              <CodeBlock
                title="claim.ts"
                lang="ts"
                code={`import { EnokiClient } from "@mysten/enoki/client";
import { toBase64 } from "@mysten/sui/utils";
import { ENOKI, NETWORK } from "@/lib/chain/config";
import { dAppKit } from "@/lib/chain/dappKit";
import { buildClaim, suiClient } from "@/lib/chain/escrow";

const transaction = await buildClaim(escrow, privateKey, recipient);

// Makes Enoki's sponsor the gas owner
await new EnokiClient({ apiKey: ENOKI.publicKey }).prepareSponsoredTransaction({
  transaction,
  network: NETWORK,
});

const built = await transaction.build({ client: suiClient });
const signed = await dAppKit.signTransaction({ transaction: toBase64(built) });

const res = await fetch("/api/claim", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ bytes: signed.bytes, signature: signed.signature }),
});`}
              />
            </>
          ),
        },
      ],
    },
    {
      id: "prices",
      title: "GET /api/prices",
      keywords: "rates usd sui lofi cache 503",
      body: (
        <>
          <p>
            Returns the dollar price of one token. See <A href="/docs/prices">Prices and tokens</A>{" "}
            for the sources.
          </p>
          <CodeBlock
            title="200 OK"
            lang="json"
            code={`{ "SUI": 0.6764, "LOFI": 0.0042 }`}
          />
          <p>
            The numbers above only show the format. A 200 response may be shared by a CDN for 15
            seconds.
          </p>
          <CodeBlock
            title="503 Service Unavailable"
            lang="json"
            code={`{ "error": "Live prices are unavailable" }`}
          />
        </>
      ),
    },
    {
      id: "impact",
      title: "GET /api/impact",
      keywords: "water donations roundups totals 503",
      body: (
        <>
          <p>
            Returns what claims have sent to the water treasury. See{" "}
            <A href="/docs/water#figures">How the totals are counted</A>.
          </p>
          <CodeBlock
            title="200 OK"
            lang="json"
            code={`{
  "donated": { "SUI": "2000000", "LOFI": "0" },
  "roundups": 2,
  "claims": 2,
  "complete": true
}`}
          />
          <DataTable
            label="GET /api/impact fields"
            head={["Field", "Type", "Description"]}
            mono={[0, 1]}
            rows={[
              ["donated", "object", "Base units received by the treasury, by token"],
              ["roundups", "number", "Claims that paid a roundup"],
              ["claims", "number", "All claims of this contract"],
              ["complete", "boolean", "False while older claims are still being read"],
            ]}
          />
          <p>
            Refreshed at most once a minute. If Sui can’t be reached, the last totals are kept for 10
            minutes. After that it answers 503.
          </p>
        </>
      ),
    },
  ],
};
