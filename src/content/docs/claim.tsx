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
            If there’s a <A href="/docs/gifts">gift inside</A>, choose <strong>Open your gift</strong>.
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
            Open <A href="/account">Your account</A> to see your balance, then send it to a friend as
            a new link or withdraw it to any Sui address.
          </p>
          <ol>
            <li>
              Choose <strong>Withdraw SUI</strong> and paste the address. For an exchange, use its SUI
              deposit address on the Sui network.
            </li>
            <li>
              Enter an amount, or choose <strong>Withdraw everything</strong>.
            </li>
            <li>Check the full address, the fee and what arrives, then confirm.</li>
          </ol>
          <p>
            Floe refuses addresses that are incomplete, reserved by Sui or the ID of an object or
            contract. It can’t tell whether an address is the one you meant, and a withdrawal can’t be
            undone.
          </p>
          <p>
            Only claims are sponsored, so the network fee comes out of the SUI in the account. A
            balance smaller than the fee can’t be moved until more SUI arrives.
          </p>
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
          them, and Google refuses to log people in from some of those browsers. Use{" "}
          <strong>Copy link</strong> on the claim page, then paste it into Safari or Chrome. If you
          don’t see that button, choose <strong>Trouble logging in?</strong> It copies the whole
          address, including the part after the <code>#</code>.
        </p>
      ),
    },
  ],
};
