import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";
import { NETWORK, PACKAGE_ID } from "@/lib/chain/config";

export const introduction: DocPage = {
  slug: "",
  file: "introduction.tsx",
  title: "Introduction",
  description:
    "Floe sends money with a link. The sender locks SUI in an escrow on Sui, and whoever opens the link claims it with a Google login.",
  sections: [
    {
      id: "what-floe-is",
      title: "What Floe is",
      body: (
        <>
          <p>
            Sending crypto to someone new usually means asking them to install a wallet, save a seed
            phrase, share a long address and find some gas. Floe replaces that with one link.
          </p>
          <p>
            The money sits in a Move contract on Sui, locked to a key that exists only inside the
            link. The recipient opens the link, continues with Google and receives the coins in an
            account of their own. They pay no gas. Floe’s servers never hold the coins or the key.
          </p>
        </>
      ),
    },
    {
      id: "how-a-payment-works",
      title: "How a payment works",
      body: (
        <ol>
          <li>
            <strong>Create.</strong> The sender picks an amount, an envelope and a note, with an
            optional <A href="/docs/gifts">card, photo or voice note</A>, then signs one transaction. It locks the coins in a new escrow object.
          </li>
          <li>
            <strong>Share.</strong> Floe builds the private link in the sender’s browser. They send
            it in a chat, or show it as a QR code.
          </li>
          <li>
            <strong>Claim.</strong> The recipient opens the link and logs in. Their browser signs the
            claim with the key in the link, and Floe’s gas sponsor pays the network fee.
          </li>
          <li>
            <strong>Open and move it.</strong> They open the gift, then keep the money, send it on or{" "}
            <A href="/docs/claim#spend-or-move">withdraw it</A>.
          </li>
          <li>
            <strong>Or refund.</strong> Until the link is claimed, the sender can take the money back
            from their dashboard.
          </li>
        </ol>
      ),
    },
    {
      id: "at-a-glance",
      title: "At a glance",
      keywords: "fees limits expiry supported tokens network package id",
      body: (
        <DataTable
          label="Floe at a glance"
          head={["Topic", "Today"]}
          rows={[
            ["Network", NETWORK === "mainnet" ? "Sui Mainnet" : "Sui Testnet"],
            [
              "Contract",
              PACKAGE_ID ? (
                <code>{PACKAGE_ID}</code>
              ) : (
                "Not connected on this site yet"
              ),
            ],
            ["Tokens", "SUI. $LOFI is available only when Floe runs on mainnet."],
            ["Link lifetime", "14 days"],
            ["Gifts", "One yeti card, photo or voice note for each link, encrypted and stored on Walrus"],
            ["Floe fee", "None. The contract takes no cut."],
            ["Gas", "The sender pays to create or refund. Floe sponsors the claim."],
            ["Who can claim", "The first person to use the full link, before it expires"],
            ["Who can refund", "The wallet that created the link, until it is claimed"],
          ]}
        />
      ),
    },
    {
      id: "project-status",
      title: "Project status",
      body: (
        <Callout kind="warning" title="Hackathon software">
          <p>
            Floe was built for the Lofi the Yeti hackathon. The contract has unit tests but has not
            been audited. Read the <A href="/docs/security">security model</A> before using it with
            anything of value.
          </p>
        </Callout>
      ),
    },
    {
      id: "where-next",
      title: "Where to go next",
      body: (
        <ul>
          <li>
            Sending or receiving money? Start with <A href="/docs/send">Send a link</A> or{" "}
            <A href="/docs/claim">Claim a payment</A>.
          </li>
          <li>
            Running the code? Follow the <A href="/docs/quickstart">quickstart</A>.
          </li>
          <li>
            Reviewing the design? Read <A href="/docs/architecture">Architecture</A>, then the{" "}
            <A href="/docs/contract">Move contract</A>.
          </li>
        </ul>
      ),
    },
  ],
};
