import { A, Callout } from "@/components/docs/Blocks";
import type { LegalDoc } from "@/content/types";
import { NETWORK } from "@/lib/chain/config";
import { CONTACT_EMAIL, ISSUES_URL, REPO_URL } from "@/lib/site";

const onTestnet = NETWORK !== "mainnet";

export const terms: LegalDoc = {
  title: "Terms of service",
  lede: "These are the rules for using Floe to create, share, claim and refund payment links.",
  updated: "November 24, 2026",
  summary: [
    "Floe is experimental software, provided as it is. The contract has not been audited.",
    "We never hold your money and can’t reverse, freeze or recover a payment.",
    "Anyone with the full link can claim it, so share it carefully.",
    "Links last 14 days. After that, only the sender can take the money back.",
    "Links hold tokens, so their value in dollars can change.",
  ],
  sections: [
    {
      id: "agreement",
      title: "Agreeing to these terms",
      body: (
        <>
          <p>
            “Floe”, “we” and “us” mean the maintainers of the Floe project. “You” means anyone who uses
            the site. By using Floe you agree to these terms and acknowledge the{" "}
            <A href="/privacy">privacy policy</A>. If you don’t agree, don’t use it.
          </p>
          <p>
            These terms cover the Floe website and its API routes. Anyone can call the contract on Sui
            directly, and other people may run their own copies of Floe. We don’t control those.
          </p>
        </>
      ),
    },
    {
      id: "status",
      title: "Experimental service",
      body: (
        <>
          {onTestnet && (
            <Callout kind="warning" title="Floe is running on Sui Testnet">
              <p>
                Tokens on testnet have no monetary value, and the network can be reset. Amounts shown
                in dollars are for illustration. Don’t treat a testnet link as a payment of real money.
              </p>
            </Callout>
          )}
          <p>
            Floe was built for a hackathon. It may have faults, change without notice or stop working.
            The contract has not been independently audited. Don’t use it with more than you can
            afford to lose.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "Who can use Floe",
      body: (
        <>
          <p>You may use Floe only if:</p>
          <ul>
            <li>You are at least 18 and able to enter into a binding agreement</li>
            <li>Using it is legal where you are</li>
            <li>You are not subject to sanctions that prohibit it</li>
          </ul>
        </>
      ),
    },
    {
      id: "what-floe-does",
      title: "What Floe does, and doesn’t do",
      body: (
        <>
          <p>
            Floe is software that helps you use a contract on Sui. The contract holds the tokens until
            someone claims or refunds them. We never have custody of them.
          </p>
          <p>
            We are not a bank, exchange, broker, escrow agent or wallet provider. Floe doesn’t convert
            tokens to cash, and nothing on the site is financial, legal or tax advice.
          </p>
          <p>We can’t:</p>
          <ul>
            <li>Reverse, change, freeze or speed up a transaction</li>
            <li>Claim or refund a link for you</li>
            <li>Recover a lost link, wallet or Google account</li>
          </ul>
        </>
      ),
    },
    {
      id: "links",
      title: "Payment links",
      body: (
        <>
          <p>
            <strong>A link works like cash.</strong> Whoever first uses the full link before it expires
            receives the money, whether or not you meant it for them. A claim is final.
          </p>
          <p>
            You are responsible for checking the amount, saving the link, choosing how to send it and
            keeping it private. We don’t keep a copy. The messaging service you choose may see the link
            and its key.
          </p>
        </>
      ),
    },
    {
      id: "expiry-and-refunds",
      title: "Expiry and refunds",
      body: (
        <ul>
          <li>A link can be claimed for 14 days after it is created.</li>
          <li>
            Until it is claimed, the sender can refund it to the account that created it, before or
            after it expires.
          </li>
          <li>Refunds are not automatic. An expired payment stays in the contract until refunded.</li>
          <li>The sender needs access to that account and enough SUI for the network fee.</li>
          <li>Once a link is claimed, only the recipient can choose to send the money back.</li>
        </ul>
      ),
    },
    {
      id: "claiming",
      title: "Claiming and your account",
      body: (
        <>
          <p>
            If you claim with Google, you receive the money in a Sui account tied to your Google login
            and to Floe’s sign-in settings. You need your Google account, and Google and Enoki must be
            available, to use it. The account doesn’t carry over to other apps. If you want full
            control, claim with a wallet, or withdraw to one.
          </p>
          <p>
            You are responsible for the address you withdraw to. Withdrawals can’t be reversed, and
            money sent to a wrong, unsupported or inaccessible address may be lost. Our address checks
            can’t catch every mistake.
          </p>
          <p>
            Claim only links that were meant for you. Keep your Google account, wallet and devices
            secure.
          </p>
        </>
      ),
    },
    {
      id: "prices",
      title: "Prices and value",
      body: (
        <p>
          A link holds a fixed number of tokens. Dollar amounts are estimates from third parties and
          may be late or wrong. Token prices can change quickly, so the recipient may get more or less
          in dollars than the sender typed. You accept that risk.
        </p>
      ),
    },
    {
      id: "fees",
      title: "Fees",
      body: (
        <>
          <p>
            Floe charges no fee at present. You pay Sui network fees to create or refund a link, or
            to withdraw.
            We currently sponsor the network fee for claims, but we may limit or stop this, and it may
            be unavailable. Your wallet or other services may charge fees of their own.
          </p>
        </>
      ),
    },
    {
      id: "water-roundup",
      title: "Clean water roundup",
      body: (
        <p>
          The roundup is optional and goes to an address set in the contract when a link is claimed.
          We don’t control that address or how its owner spends what it receives, and Floe is not a
          charity. Impact figures are illustrative, and some are sample data. Don’t assume that a
          roundup is tax deductible.
        </p>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      body: (
        <>
          <p>You agree not to use Floe to:</p>
          <ul>
            <li>Break the law, launder money, evade sanctions or fund crime</li>
            <li>Commit fraud, or trick someone into opening a link or giving up one</li>
            <li>Take money using a link that was not meant for you</li>
            <li>Send unwanted messages, or pretend to be someone else</li>
            <li>Abuse sponsored gas, overload the service or get around its limits</li>
            <li>Attack the service or its users, except for good-faith security research</li>
          </ul>
          <p>
            We may block access to the site or refuse to sponsor a claim if we reasonably believe these
            terms were broken or the law requires it. This doesn’t give us access to money in the
            contract.
          </p>
        </>
      ),
    },
    {
      id: "taxes",
      title: "Taxes and your legal duties",
      body: (
        <p>
          You are responsible for any taxes, reports and other legal duties that arise from what you
          send or receive.
        </p>
      ),
    },
    {
      id: "third-parties",
      title: "Other services",
      body: (
        <p>
          Floe depends on services we don’t control, including Sui, Enoki, Google, wallets, price
          sources and hosting. Their terms apply to your use of them. We are not responsible for their
          faults, delays or decisions.
        </p>
      ),
    },
    {
      id: "source-code",
      title: "Source code and names",
      body: (
        <p>
          The source code is at <A href={REPO_URL}>github.com/Dominion116/Floe</A>, and any license in
          that repository governs your use of the code. Other names and logos belong to their owners.
          Using them here doesn’t mean that they endorse Floe.
        </p>
      ),
    },
    {
      id: "risks",
      title: "Risks you accept",
      body: (
        <>
          <p>Using Floe involves risks that could lose some or all of the money in a link:</p>
          <ul>
            <li>Faults in the contract, the site or Sui</li>
            <li>A leaked, lost or intercepted link</li>
            <li>A compromised device, browser extension or account</li>
            <li>Losing access to the Google account or wallet you used</li>
            <li>Changes in token prices</li>
            <li>An outage, or a service we rely on closing</li>
            <li>Changes in the law</li>
          </ul>
        </>
      ),
    },
    {
      id: "no-warranty",
      title: "No warranty",
      body: (
        <p>
          To the extent the law allows, Floe is provided “as is” and “as available”, without warranties
          of any kind, express or implied. That includes warranties of merchantability, fitness for a
          particular purpose, title and non-infringement, and any promise that Floe will be
          uninterrupted, secure or free of errors.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limits on liability",
      body: (
        <>
          <p>
            To the extent the law allows, we are not liable for indirect, incidental, special,
            consequential or punitive damages, or for lost money, tokens, profits, data or goodwill,
            arising from your use of Floe or from being unable to use it.
          </p>
          <p>
            Nothing in these terms limits liability that can’t be limited by law, or takes away rights
            you have as a consumer.
          </p>
        </>
      ),
    },
    {
      id: "ending",
      title: "Stopping and changes to Floe",
      body: (
        <p>
          You can stop using Floe at any time. We may change, pause or close the site. Closing it
          doesn’t close open links: money stays in the contract, and a sender can still refund it by
          calling the contract from the account that created the link. Someone who claimed with Google
          may lose the practical means to use that account, so don’t use it for long-term storage.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: (
        <p>
          We may update these terms. The date at the top shows the latest version, and earlier ones are
          in the project’s public{" "}
          <A href={`${REPO_URL}/commits/main/src/content/legal/terms.tsx`}>history</A>. A new version
          applies from that date. If you use Floe after it, you accept the new version.
        </p>
      ),
    },
    {
      id: "general",
      title: "General",
      body: (
        <p>
          If part of these terms can’t be enforced, the rest still applies. If we don’t enforce a term,
          we haven’t given up the right to. These terms, with the privacy policy, are the whole
          agreement between you and us about Floe. Please contact us first about any dispute, so we can
          try to settle it informally.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: CONTACT_EMAIL ? (
        <p>
          Email <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>. Never include a payment link. Anyone
          who reads it can take the money.
        </p>
      ) : (
        <p>
          Open an issue on <A href={ISSUES_URL}>GitHub</A>. Issues are public, so never include a
          payment link or personal details.
        </p>
      ),
    },
  ],
};
