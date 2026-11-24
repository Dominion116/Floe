import { A, Callout, CodeBlock, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const refunds: DocPage = {
  slug: "refunds",
  file: "refunds.tsx",
  title: "Track and refund",
  description: "See what happened to each link, and take back money that nobody has claimed.",
  sections: [
    {
      id: "dashboard",
      title: "The dashboard",
      body: (
        <>
          <p>
            <A href="/dashboard">Your dashboard</A> lists the links created in this browser. Each time
            it opens, Floe reads the state of every open link from Sui, so the status comes from the
            chain rather than a Floe database.
          </p>
          <Callout title="The list stays in this browser">
            <p>
              Links you create on your phone don’t appear on your laptop. Clearing site data removes
              the list, but the money stays in its escrow. See{" "}
              <A href="#refund-without-the-dashboard">Refund without the dashboard</A>.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "statuses",
      title: "Link statuses",
      keywords: "confirming pending claimed expired reclaimed",
      body: (
        <DataTable
          label="Link statuses"
          head={["Status", "Meaning", "Refundable"]}
          rows={[
            [
              "Confirming",
              "Signed, and waiting for Sui. It is removed if it failed, or if Sui still has no record of it after an hour.",
              "Not yet",
            ],
            ["Pending", "Locked in escrow and waiting to be claimed.", "Yes"],
            ["Expired", "Not claimed within 14 days, so it no longer can be.", "Yes"],
            ["Claimed", "Paid to the recipient, whose address is shown.", "No"],
            ["Reclaimed", "Returned to the sender.", "No"],
          ]}
        />
      ),
    },
    {
      id: "refund",
      title: "Refund a link",
      keywords: "cancel clawback reclaim money back",
      body: (
        <>
          <ol>
            <li>
              On the link’s card, choose <strong>Cancel &amp; refund</strong>.
            </li>
            <li>Connect the same account that created the link. No other account can refund it.</li>
            <li>Approve the transaction. You pay its network fee.</li>
          </ol>
          <p>
            The escrow closes, the link stops working and the full amount returns to you, including
            the roundup. You can do this at any time until someone claims, before or after the link
            expires. If a claim reaches Sui first, the refund fails and nothing changes.
          </p>
        </>
      ),
    },
    {
      id: "no-automatic-refund",
      title: "Refunds are not automatic",
      body: (
        <p>
          When a link expires, the money stays in the escrow until the sender refunds it. Nobody else
          can take it, and there is no deadline.
        </p>
      ),
    },
    {
      id: "refund-without-the-dashboard",
      title: "Refund without the dashboard",
      keywords: "lost history cleared storage sui client call reclaim_escrow cli",
      body: (
        <>
          <p>
            If the list is gone, you can call the contract yourself from the wallet that created the
            link. Find the escrow ID in that wallet’s history on an explorer: it is the{" "}
            <code>PaymentEscrow</code> object created by the payment.
          </p>
          <CodeBlock
            title="Terminal"
            lang="bash"
            code={`sui client call \\
  --package <PACKAGE_ID> \\
  --module escrow \\
  --function reclaim_escrow \\
  --type-args 0x2::sui::SUI \\
  --args <ESCROW_ID>`}
          />
          <p>
            This needs the wallet’s key in the Sui CLI, so it doesn’t work for links paid from a
            Google account.
          </p>
        </>
      ),
    },
  ],
};
