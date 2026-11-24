import { A, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const architecture: DocPage = {
  slug: "architecture",
  file: "architecture.tsx",
  title: "Architecture",
  description: "Which part does what, and how a payment moves between the browser, Sui and the server.",
  sections: [
    {
      id: "parts",
      title: "The parts",
      body: (
        <>
          <p>
            Floe is a Next.js app with two small API routes and one Move module. There is no database
            and no user table.
          </p>
          <DataTable
            label="Parts of Floe"
            head={["Part", "Responsible for", "Never has"]}
            rows={[
              [
                "Browser",
                "Link keys, transactions, the sender’s history and reading Sui",
                "The sponsor’s private API key",
              ],
              [
                "Move contract",
                "Holding coins, checking signatures and paying out",
                "The link’s private key",
              ],
              ["/api/claim", "Checking a signed claim and asking Enoki to pay its gas", "The key or note"],
              ["/api/prices", "Live SUI and $LOFI prices", "Anything about a payment"],
              ["Enoki", "Google zkLogin accounts and gas sponsorship", "The link’s private key"],
              ["Sui nodes", "Current objects over gRPC, and past events over GraphQL", "The key or note"],
            ]}
          />
        </>
      ),
    },
    {
      id: "create-flow",
      title: "Creating a link",
      keywords: "sender flow keypair digest unconfirmed idempotent",
      body: (
        <ol>
          <li>
            The browser makes a new Ed25519 keypair in memory. Each link has its own.
          </li>
          <li>
            The sender signs a transaction that calls <code>create_escrow</code> with the coins and
            the public key.
          </li>
          <li>
            Before sending, Floe computes the transaction digest and saves a history record under it.
            The record never includes the private key.
          </li>
          <li>
            The browser sends the signed bytes. If the reply is lost, it looks the digest up on the
            full node and in GraphQL before saying what happened.
          </li>
          <li>
            Once the escrow ID is known, the browser builds the link from the ID, the private key and
            the note.
          </li>
        </ol>
      ),
    },
    {
      id: "claim-flow",
      title: "Claiming a link",
      keywords: "recipient flow signature sponsor verify",
      body: (
        <ol>
          <li>
            The claim page reads the escrow ID from the query and the key from the fragment, then
            loads the escrow from Sui.
          </li>
          <li>The recipient logs in with Google or connects a wallet, which gives an address.</li>
          <li>
            The key in the link signs 64 bytes: the escrow ID, then that address. The signature goes
            into a <code>claim_escrow</code> transaction. The key does not.
          </li>
          <li>The recipient’s account signs the transaction, with Enoki set to pay the gas.</li>
          <li>
            <A href="/docs/http-api#claim">POST /api/claim</A> checks and simulates it, then Enoki
            sponsors and runs it.
          </li>
          <li>
            The contract verifies the signature, pays the recipient and the treasury, and deletes the
            escrow.
          </li>
        </ol>
      ),
    },
    {
      id: "refund-flow",
      title: "Refunding a link",
      body: (
        <p>
          The sender calls <code>reclaim_escrow</code> directly from their account. No Floe server
          takes part, and the claim key isn’t needed.
        </p>
      ),
    },
    {
      id: "escrow-life",
      title: "The life of an escrow",
      keywords: "state machine lifecycle",
      body: (
        <>
          <CodeBlock
            title="Escrow states"
            code={`create_escrow ──▶ open ──┬── claim_escrow, up to expiry ──▶ deleted, recipient paid
                         │
                         └── reclaim_escrow, any time ────▶ deleted, sender refunded`}
          />
          <p>
            An escrow is a shared object that is deleted when it closes, so it can pay out only once.
            If a claim and a refund race, Sui orders them and the second one fails.
          </p>
        </>
      ),
    },
    {
      id: "status-sync",
      title: "How status is worked out",
      keywords: "sync events graphql grpc pruned",
      body: (
        <>
          <p>
            The dashboard asks a full node for each open escrow, 50 at a time. If one is gone, Floe
            finds the transaction that closed it and reads its event to tell a claim from a refund.
            Those lookups use GraphQL, because full nodes drop old transactions.
          </p>
          <p>
            An unreadable escrow is never treated as missing. Its last known status stays until Sui
            gives a definite answer.
          </p>
        </>
      ),
    },
    {
      id: "stack",
      title: "Stack",
      body: (
        <DataTable
          label="Technology stack"
          head={["Layer", "Technology"]}
          rows={[
            ["App", "Next.js 15, React 19, TypeScript"],
            ["Style and motion", "Tailwind CSS, Framer Motion"],
            ["Sui", "@mysten/sui, @mysten/dapp-kit-react"],
            ["Login and gas", "@mysten/enoki"],
            ["Contract", "Move, 2024 edition"],
          ]}
        />
      ),
    },
  ],
};
