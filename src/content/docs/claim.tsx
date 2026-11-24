import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const claim: DocPage = {
  slug: "claim",
  file: "claim.tsx",
  title: "Claim a payment",
  description: "Open the link, log in and the money is yours. No wallet, seed phrase or gas needed.",
  sections: [
    {
      id: "with-google",
      title: "Claim with Google",
      body: (
        <ol>
          <li>Open the link you were sent. You’ll see the envelope, the amount and the note.</li>
          <li>
            Choose <strong>Continue with Google</strong> and pick your account in the window that
            opens.
          </li>
          <li>
            Wait while Floe shows <em>Authenticating</em>, <em>Verifying</em> and <em>Claiming</em>.
          </li>
          <li>
            The final screen shows the amount, your Sui address and a link to the transaction on a
            public explorer.
          </li>
        </ol>
      ),
    },
    {
      id: "with-a-wallet",
      title: "Claim with a Sui wallet",
      keywords: "slush connect wallet",
      body: (
        <p>
          Already have a wallet? Choose <strong>Connect Sui wallet</strong> under the Google button
          and pick it from the list. Floe sponsors the gas for this claim too.
        </p>
      ),
    },
    {
      id: "your-account",
      title: "Your account",
      keywords: "zklogin address keep access google account lost",
      body: (
        <>
          <p>
            Logging in with Google creates a Sui account using{" "}
            <A href="/docs/login-and-gas">zkLogin</A>. The account belongs to your Google login, and
            Floe can’t move what’s inside it.
          </p>
          <Callout kind="warning" title="Keep access to your Google account">
            <p>
              There is no seed phrase and no backup. The account is also specific to Floe: logging in
              to another app with the same Google account gives you a different Sui address.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "spend-or-move",
      title: "Spend or move the money",
      keywords: "withdraw export transfer send cash out",
      body: (
        <>
          <p>
            Floe has no withdraw screen yet, but you can send the money on as a new link, including
            to yourself:
          </p>
          <ol>
            <li>
              Choose <strong>Send to a friend</strong> and enter an amount. Leave a little SUI for
              the network fee, because only claims are sponsored.
            </li>
            <li>Pay from your Google account and copy the new link.</li>
            <li>
              Open it and choose <strong>Connect Sui wallet</strong> to claim into a wallet you
              control.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "when-a-link-does-not-open",
      title: "When a link doesn’t open",
      keywords: "already claimed expired incomplete melted took money back",
      body: (
        <DataTable
          label="Claim page messages"
          head={["Message", "Meaning"]}
          rows={[
            [
              "This link is incomplete",
              "Part of it was cut off. Ask the sender to copy the whole link again.",
            ],
            [
              "This money was already claimed",
              "Someone used the link first. If that wasn’t you, ask the sender who else has it.",
            ],
            ["The sender took this money back", "It was refunded. Ask for a new link."],
            [
              "This link has expired",
              "The 14 days passed. The money can only go back to the sender now.",
            ],
            [
              "This link has melted away",
              "The escrow no longer exists, and its history couldn’t be found yet.",
            ],
            ["Unable to load this link", "Sui couldn’t be reached. Check your connection."],
            [
              "Claiming isn’t set up yet",
              "This site isn’t connected to a Floe contract. The money hasn’t moved.",
            ],
          ]}
        />
      ),
    },
    {
      id: "login-window",
      title: "If the login window doesn’t open",
      keywords: "popup blocked in-app browser telegram whatsapp google disallowed_useragent",
      body: (
        <p>
          Login uses a pop-up, so allow pop-ups for the site. Browsers inside chat apps often block
          them, and Google refuses to log people in from some of those browsers. Open the link in
          Safari or Chrome instead, and make sure the whole address moves with you, including the
          part after the <code>#</code>.
        </p>
      ),
    },
  ],
};
