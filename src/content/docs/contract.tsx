import { A, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

const PARAM_HEAD = ["Parameter", "Type", "Description"];
const FIELD_HEAD = ["Field", "Type", "Description"];

export const contract: DocPage = {
  slug: "contract",
  file: "contract.tsx",
  title: "Move contract",
  description: "Reference for floe::escrow: one object, three functions and three events.",
  sections: [
    {
      id: "overview",
      title: "Overview",
      body: (
        <p>
          The module is in <code>move/sources/escrow.move</code>, written in Move 2024. Every function
          is generic over the coin type <code>T</code>. There is no admin capability, fee or registry.
        </p>
      ),
    },
    {
      id: "payment-escrow",
      title: "PaymentEscrow",
      keywords: "struct object shared bcs field order",
      body: (
        <>
          <p>
            A shared object that holds one payment. It has <code>key</code> only, so it can’t be
            wrapped or transferred.
          </p>
          <DataTable
            label="PaymentEscrow fields"
            head={FIELD_HEAD}
            mono={[0, 1]}
            rows={[
              ["id", "UID", "The escrow ID used in the link"],
              ["balance", "Balance<T>", "What the recipient gets"],
              ["sender", "address", "The only address that can refund"],
              ["ephemeral_pubkey", "vector<u8>", "The link’s Ed25519 public key, 32 bytes"],
              ["expires_at_ms", "u64", "The last moment a claim is accepted"],
              ["water_donation", "Balance<T>", "The roundup, or zero"],
              ["theme_id", "u8", "The envelope, for display only"],
            ]}
          />
          <p>
            The app decodes this layout by field order. If you change it, update{" "}
            <code>EscrowLayout</code> in <code>src/lib/chain/escrow.ts</code>.
          </p>
        </>
      ),
      children: [
        {
          id: "themes",
          title: "Theme IDs",
          keywords: "glacial coffee birthday water",
          body: (
            <>
              <DataTable
                label="Theme IDs"
                head={["ID", "Name"]}
                mono={[0]}
                rows={[
                  ["0", "Yeti Glacial"],
                  ["1", "Coffee Chill"],
                  ["2", "Birthday Pop"],
                  ["3", "Clean Water Blue"],
                ]}
              />
              <p>The contract accepts any value. The app shows unknown IDs as Yeti Glacial.</p>
            </>
          ),
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      body: <p>All three are public and return nothing.</p>,
      children: [
        {
          id: "create-escrow",
          title: "create_escrow",
          keywords: "coin ephem_pubkey duration_ms water_cut EInsufficientBalance EInvalidPublicKey EInvalidDuration",
          body: (
            <>
              <p>Locks a coin and shares the escrow.</p>
              <CodeBlock
                title="escrow.move"
                lang="move"
                code={`public fun create_escrow<T>(
    mut coin: Coin<T>,
    ephem_pubkey: vector<u8>,
    duration_ms: u64,
    water_cut: u64,
    theme_id: u8,
    clock: &Clock,
    ctx: &mut TxContext,
)`}
              />
              <DataTable
                label="create_escrow parameters"
                head={PARAM_HEAD}
                mono={[0, 1]}
                rows={[
                  ["coin", "Coin<T>", "The payment and the roundup together"],
                  ["ephem_pubkey", "vector<u8>", "Must be 32 bytes"],
                  ["duration_ms", "u64", "More than 0, up to 365 days. The app uses 14 days."],
                  ["water_cut", "u64", "Taken from coin for the treasury. Must be less than its value."],
                  ["theme_id", "u8", "See Theme IDs"],
                  ["clock", "&Clock", "The shared clock, 0x6"],
                ]}
              />
              <p>
                Aborts with <code>EInsufficientBalance</code>, <code>EInvalidPublicKey</code> or{" "}
                <code>EInvalidDuration</code>. Emits <code>EscrowCreated</code>.
              </p>
            </>
          ),
        },
        {
          id: "claim-escrow",
          title: "claim_escrow",
          keywords: "signature recipient EEscrowExpired EInvalidSignature",
          body: (
            <>
              <p>
                Pays the recipient and the treasury, then deletes the escrow. Anyone may submit it,
                because the signature decides where the money goes.
              </p>
              <CodeBlock
                title="escrow.move"
                lang="move"
                code={`public fun claim_escrow<T>(
    escrow: PaymentEscrow<T>,
    signature: vector<u8>,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
)`}
              />
              <DataTable
                label="claim_escrow parameters"
                head={PARAM_HEAD}
                mono={[0, 1]}
                rows={[
                  ["escrow", "PaymentEscrow<T>", "The shared escrow, by value"],
                  ["signature", "vector<u8>", "64-byte Ed25519 signature of the claim message"],
                  ["recipient", "address", "Receives the payment"],
                  ["clock", "&Clock", "The shared clock, 0x6"],
                ]}
              />
              <p>
                Aborts with <code>EEscrowExpired</code> after <code>expires_at_ms</code>, or{" "}
                <code>EInvalidSignature</code>. Emits <code>EscrowClaimed</code>.
              </p>
            </>
          ),
        },
        {
          id: "reclaim-escrow",
          title: "reclaim_escrow",
          keywords: "refund EUnauthorized",
          body: (
            <>
              <p>
                Returns the payment and the roundup to the sender, and deletes the escrow. Works at any
                time while the escrow exists.
              </p>
              <CodeBlock
                title="escrow.move"
                lang="move"
                code={`public fun reclaim_escrow<T>(escrow: PaymentEscrow<T>, ctx: &mut TxContext)`}
              />
              <p>
                Aborts with <code>EUnauthorized</code> unless the caller is the sender. Emits{" "}
                <code>EscrowReclaimed</code>.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "claim-message",
      title: "The claim message",
      keywords: "bytes bcs sign 64 bytes claimMessage",
      body: (
        <>
          <p>The link’s key signs exactly 64 bytes, with no prefix or hash applied first:</p>
          <CodeBlock
            title="Claim message"
            code={`bytes  0–31   escrow ID
bytes 32–63   recipient address`}
          />
          <p>
            <code>claimMessage</code> in the <A href="/docs/client#escrow">client library</A> builds
            the same bytes.
          </p>
        </>
      ),
    },
    {
      id: "events",
      title: "Events",
      keywords: "EscrowCreated EscrowClaimed EscrowReclaimed",
      body: (
        <>
          <DataTable
            label="Events"
            head={["Event", "Fields"]}
            mono={[0]}
            rows={[
              ["EscrowCreated", "escrow_id, sender, amount, water_donation, theme_id"],
              ["EscrowClaimed", "escrow_id, recipient, amount, water_donation"],
              ["EscrowReclaimed", "escrow_id, sender, amount"],
            ]}
          />
          <p>
            Amounts are in base units. In <code>EscrowCreated</code> and <code>EscrowClaimed</code> the
            amount leaves out the roundup. In <code>EscrowReclaimed</code> it includes it.
          </p>
        </>
      ),
    },
    {
      id: "errors",
      title: "Error codes",
      keywords: "abort EInvalidSignature EEscrowExpired EUnauthorized EInsufficientBalance EInvalidPublicKey EInvalidDuration",
      body: (
        <>
          <DataTable
            label="Error codes"
            head={["Code", "Name", "Cause"]}
            mono={[0, 1]}
            rows={[
              ["0", "EInvalidSignature", "The signature doesn’t match the escrow and recipient"],
              ["1", "EEscrowExpired", "The claim came after the escrow expired"],
              ["3", "EUnauthorized", "Someone other than the sender tried to refund"],
              ["4", "EInsufficientBalance", "The coin isn’t worth more than the roundup"],
              ["5", "EInvalidPublicKey", "The public key isn’t 32 bytes"],
              ["6", "EInvalidDuration", "The duration is zero or more than 365 days"],
            ]}
          />
          <p>Code 2 is not used.</p>
        </>
      ),
    },
    {
      id: "constants",
      title: "Constants",
      keywords: "MAX_DURATION_MS CLEAN_WATER_TREASURY",
      body: (
        <DataTable
          label="Constants"
          head={["Name", "Value"]}
          mono={[0]}
          rows={[
            ["ED25519_PUBLIC_KEY_LENGTH", "32"],
            ["MAX_DURATION_MS", "31,536,000,000 (365 days)"],
            [
              "CLEAN_WATER_TREASURY",
              <span key="t">
                Shown on <A href="/docs/water#treasury">Clean water roundup</A>
              </span>,
            ],
          ]}
        />
      ),
    },
  ],
};
