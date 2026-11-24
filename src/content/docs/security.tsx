import { A, Callout, DataTable, LinkAnatomy } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";
import { ISSUES_URL } from "@/lib/site";

export const security: DocPage = {
  slug: "security",
  file: "security.tsx",
  title: "Security model",
  description: "What protects the money, what you have to trust, and what Floe can’t protect against.",
  sections: [
    {
      id: "the-link",
      title: "Anatomy of a link",
      keywords: "fragment hash private key url ephemeral",
      body: (
        <>
          <LinkAnatomy />
          <p>
            The part after the <code>#</code> is the URL fragment. Browsers keep it on the device when
            they request a page, and leave it out of the referrer. Floe’s code reads it in the
            browser and never uploads it.
          </p>
          <Callout kind="warning" title="The link is the money">
            <p>
              Floe can’t see the key, but anyone who sees the full link can use it. That includes
              whoever reads the chat, a QR code photo or the browser history of a shared device.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "guarantees",
      title: "What the contract enforces",
      keywords: "signature replay front-running double claim",
      body: (
        <DataTable
          label="Guarantees enforced by the contract"
          head={["Rule", "How"]}
          rows={[
            [
              "Only the link’s key can direct a claim",
              "An Ed25519 signature is checked against the public key saved in the escrow.",
            ],
            [
              "A copied signature can’t be redirected",
              "The signed message includes the recipient’s address.",
            ],
            [
              "A signature can’t be reused on another escrow",
              "The signed message includes the escrow ID.",
            ],
            ["An escrow pays once", "Claiming or refunding consumes and deletes the object."],
            ["Expired links can’t be claimed", "The time comes from Sui’s shared clock."],
            ["Only the sender can refund", "The transaction sender must match the escrow’s sender."],
            ["Donations can’t be redirected", "The treasury address is a constant in the contract."],
            [
              "Floe can’t take the money",
              "The module has no admin function, fee or withdrawal path.",
            ],
          ]}
        />
      ),
    },
    {
      id: "trust",
      title: "What you have to trust",
      keywords: "assumptions upgrade package enoki google",
      body: (
        <ul>
          <li>
            <strong>The site’s code.</strong> It handles the key in your browser. A compromised site,
            browser extension or device could read it.
          </li>
          <li>
            <strong>The published package.</strong> It is unaudited. Check its on-chain upgrade policy
            before relying on it, because that depends on how it was published.
          </li>
          <li>
            <strong>Google and Enoki</strong>, for accounts made with Google. Both must be working for
            you to log in. A zkLogin account needs them to sign.
          </li>
          <li>
            <strong>Sui</strong>, to order and run transactions.
          </li>
        </ul>
      ),
    },
    {
      id: "server",
      title: "What the server can do",
      body: (
        <>
          <p>
            <code>/api/claim</code> receives a transaction the recipient has already signed. It can
            refuse to sponsor it, but any change would break the signature. It accepts exactly one
            call to <code>claim_escrow</code> and simulates it first, so the gas budget can’t be spent
            on anything else.
          </p>
          <p>
            If sponsorship is down, the money is unaffected. The sender can still refund, because
            that doesn’t go through Floe.
          </p>
        </>
      ),
    },
    {
      id: "public-data",
      title: "What is public on Sui",
      keywords: "privacy onchain visible",
      body: (
        <>
          <p>
            Anyone can see the sender’s address, the amount, the token, the roundup, the envelope
            theme, the expiry, the link’s public key and, after a claim, the recipient’s address. The
            note and the private key are not on chain. The{" "}
            <A href="/privacy">privacy policy</A> covers this in full.
          </p>
        </>
      ),
    },
    {
      id: "known-limits",
      title: "Known limits",
      body: (
        <ul>
          <li>The contract has not been audited.</li>
          <li>
            A link works for whoever opens it first. It can’t be limited to one person or email
            address.
          </li>
          <li>The note is part of the link and is not signed, so someone forwarding it could edit it.</li>
          <li>
            The sender’s name isn’t shown or verified. A link proves there is money in it, not who
            sent it.
          </li>
          <li>
            The unit tests cover payouts, refunds, expiry and rejected signatures. They don’t run a
            full claim with a real signature.
          </li>
        </ul>
      ),
    },
    {
      id: "report",
      title: "Report a problem",
      keywords: "vulnerability disclosure bug",
      body: (
        <p>
          Open an issue on <A href={ISSUES_URL}>GitHub</A>. Issues are public, so for a vulnerability
          say only that you have one and ask for a private channel. Never include a working link or
          key.
        </p>
      ),
    },
  ],
};
