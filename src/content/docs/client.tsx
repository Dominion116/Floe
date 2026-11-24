import { A, Callout, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

const HEAD = ["Export", "Returns", "What it does"];

export const client: DocPage = {
  slug: "client",
  file: "client.tsx",
  title: "Client library",
  description: "The TypeScript functions the app uses to build links, read escrows and make transactions.",
  sections: [
    {
      id: "overview",
      title: "Overview",
      body: (
        <p>
          These are modules inside the repository, imported through the <code>@/</code> alias. They
          are not published to npm.
        </p>
      ),
    },
    {
      id: "crypto",
      title: "Links and keys",
      keywords: "generateEphemeralKeypair buildClaimUrl parseClaimFragment MAX_NOTE_LENGTH crypto.ts",
      body: (
        <>
          <p>
            From <code>src/lib/crypto.ts</code>.
          </p>
          <DataTable
            label="crypto.ts exports"
            head={HEAD}
            mono={[0, 1]}
            rows={[
              [
                "generateEphemeralKeypair()",
                "EphemeralKeys",
                "Makes a new Ed25519 keypair in memory",
              ],
              [
                "buildClaimUrl(baseUrl, escrowId, privateKey, note?)",
                "string",
                "Builds the link, with the key and note in the fragment",
              ],
              [
                "parseClaimFragment(hash)",
                "{ privateKey, note }",
                "Reads the fragment. The note is cut to 60 characters.",
              ],
              ["MAX_NOTE_LENGTH", "60", "The longest note"],
            ]}
          />
          <CodeBlock
            title="Link format"
            code={`<base>/claim?id=<escrow ID>#k=<private key>&n=<note>`}
          />
        </>
      ),
    },
    {
      id: "escrow",
      title: "Escrows and transactions",
      keywords:
        "readEscrows readClosed readCreated createdEscrowId buildCreate buildClaim buildReclaim claimMessage toUnits fromUnits chainErrorMessage escrow.ts",
      body: (
        <>
          <p>
            From <code>src/lib/chain/escrow.ts</code>.
          </p>
          <DataTable
            label="escrow.ts exports"
            head={HEAD}
            mono={[0, 1]}
            rows={[
              ["readEscrows(ids)", "Map<string, Escrow | null>", "Reads open escrows, 50 at a time"],
              ["readClosed(escrowId)", "Closed | null", "Finds how a deleted escrow ended"],
              ["readCreated(digest)", "CreateOutcome", "Finds what became of a create transaction"],
              ["createdEscrowId(tx)", "string | null", "Gets the escrow ID from a transaction result"],
              ["buildCreate(input)", "Transaction", "Builds a create_escrow call"],
              [
                "buildClaim(escrow, privateKey, recipient)",
                "Transaction",
                "Signs the claim message and builds a claim_escrow call",
              ],
              ["buildReclaim(escrow)", "Transaction", "Builds a reclaim_escrow call"],
              ["claimMessage(escrowId, recipient)", "Uint8Array", "The 64 bytes the key signs"],
              ["toUnits(amount)", "bigint", "Decimal to base units, at four decimal places"],
              ["fromUnits(units)", "number", "Base units to decimal, for display"],
              ["chainErrorMessage(err, fallback)", "string", "A message that is safe to show"],
            ]}
          />
          <p>
            The read functions and <code>buildClaim</code> return promises of these types.
          </p>
        </>
      ),
      children: [
        {
          id: "missing-or-unreadable",
          title: "Missing is not the same as unreadable",
          body: (
            <p>
              In the map from <code>readEscrows</code>, <code>null</code> means the escrow no longer
              exists. An absent ID means it couldn’t be read, so its status is unknown. Likewise, a{" "}
              <code>CreateOutcome</code> of <code>unknown</code> must never be treated as a failure,
              because the money may already be locked.
            </p>
          ),
        },
      ],
    },
    {
      id: "create-example",
      title: "Example: create a link",
      body: (
        <>
          <CodeBlock
            title="create.ts"
            lang="ts"
            code={`import { LINK_DURATION_MS } from "@/lib/chain/config";
import { buildCreate, toUnits } from "@/lib/chain/escrow";
import { buildClaimUrl, generateEphemeralKeypair } from "@/lib/crypto";

const keys = generateEphemeralKeypair();

const transaction = buildCreate({
  token: "SUI",
  amountUnits: toUnits(10),
  waterUnits: toUnits(0.15),
  publicKeyHex: keys.publicKeyHex,
  durationMs: LINK_DURATION_MS,
  themeId: "glacial",
});

// Sign and send it, then read the escrow ID from the result.

const url = buildClaimUrl(
  window.location.origin,
  escrowId,
  keys.privateKey,
  "Thanks for lunch!"
);`}
          />
          <Callout kind="warning" title="Handle the private key with care">
            <p>
              Keep it in memory until it becomes part of the link. Don’t log it, store it or send it
              in a request.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "storage",
      title: "Saved history",
      keywords: "localStorage floe_links_v2 PaymentLinkRecord saveLink updateLink removeLink getStoredLinks",
      body: (
        <>
          <p>
            <code>src/lib/storage.ts</code> keeps an array of <code>PaymentLinkRecord</code> in{" "}
            <code>localStorage</code>, under{" "}
            <code>floe_links_v2:&lt;network&gt;:&lt;package ID&gt;</code>. Each deployment therefore
            has its own list.
          </p>
          <DataTable
            label="storage.ts exports"
            head={HEAD}
            mono={[0, 1]}
            rows={[
              ["getStoredLinks()", "PaymentLinkRecord[]", "Reads the list, or an empty one"],
              ["saveLink(record)", "void", "Adds a record. Throws if storage is unavailable."],
              ["updateLink(digest, changes)", "void", "Changes one record"],
              ["removeLink(digest)", "void", "Deletes one record"],
              ["clearObsoleteLinks()", "void", "Deletes the first version’s data, which held keys"],
            ]}
          />
        </>
      ),
      children: [
        {
          id: "record",
          title: "PaymentLinkRecord",
          body: (
            <DataTable
              label="PaymentLinkRecord fields"
              head={["Field", "Type", "Description"]}
              mono={[0, 1]}
              rows={[
                ["digest", "string", "Create transaction digest. Identifies the record."],
                ["escrowId", "string | null", "Null until the payment is confirmed"],
                ["sender", "string", "The account that paid"],
                ["currency", "USD | SUI | LOFI", "What the sender typed in"],
                ["enteredAmount", "number", "The amount they typed"],
                ["token", "SUI | LOFI", "What the escrow holds"],
                ["amountUnits", "string", "The held amount, in base units"],
                ["recipientNote", "string", "The note"],
                ["themeId", "CardThemeId", "The envelope"],
                ["hasWaterDonation", "boolean", "Whether the roundup was on"],
                ["createdAt", "number", "Milliseconds since 1970"],
                ["expiresAt", "number", "Milliseconds since 1970"],
                ["status", "EscrowStatus", "creating, pending, claimed, expired or reclaimed"],
                ["claimedBy", "string?", "The recipient’s address"],
                ["closedAt", "number?", "When it was claimed or refunded"],
              ]}
            />
          ),
        },
      ],
    },
    {
      id: "hooks",
      title: "React hooks",
      keywords: "useLinks usePrices refreshPrices syncLinks",
      body: (
        <>
          <DataTable
            label="React hooks"
            head={HEAD}
            mono={[0, 1]}
            rows={[
              ["useLinks()", "{ links, status, refresh }", "Saved links, updated from Sui"],
              ["usePrices(enabled?)", "{ rates, status }", "Live prices while something shows them"],
            ]}
          />
          <p>
            <code>rates</code> is <code>null</code> until prices are known, and becomes{" "}
            <code>null</code> again when they go stale. See <A href="/docs/prices#freshness">How fresh
            they are</A>.
          </p>
        </>
      ),
    },
  ],
};
