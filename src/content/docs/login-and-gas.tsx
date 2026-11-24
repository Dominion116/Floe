import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const loginAndGas: DocPage = {
  slug: "login-and-gas",
  file: "login-and-gas.tsx",
  title: "Login and gas",
  description: "How a Google login becomes a Sui account, and how claims run without a balance.",
  sections: [
    {
      id: "zklogin",
      title: "Google login",
      keywords: "zklogin oauth openid jwt salt proof email scope",
      body: (
        <>
          <p>
            Floe uses <A href="https://docs.sui.io/guides/developer/cryptography/zklogin">Sui zkLogin</A>{" "}
            through Enoki. Google confirms who you are, Enoki derives your address, and a
            zero-knowledge proof lets your login authorize transactions without publishing your Google
            identity.
          </p>
          <p>
            Floe asks Google for the <code>openid</code> scope only. It doesn’t request your email,
            name, contacts or photo.
          </p>
        </>
      ),
    },
    {
      id: "login-flow",
      title: "What happens when you log in",
      body: (
        <ol>
          <li>The browser creates a short-lived session key and gets a nonce from Enoki.</li>
          <li>
            A pop-up opens Google’s login page. Google returns an ID token to <code>/auth</code>, and
            the page that opened the pop-up reads it and closes it.
          </li>
          <li>The browser sends the token to Enoki, which returns your Sui address.</li>
          <li>
            When you first sign something, Enoki returns a proof that ties the session key to your
            login.
          </li>
        </ol>
      ),
    },
    {
      id: "redirect",
      title: "The link stays out of login",
      body: (
        <p>
          The redirect goes to a fixed page, <code>/auth</code>, and the claim page stays open behind
          the pop-up. The payment link is never part of the address Google sees.
        </p>
      ),
    },
    {
      id: "sessions",
      title: "Sessions and shared devices",
      keywords: "logout sign out disconnect indexeddb",
      body: (
        <>
          <p>
            The session is kept in this browser’s IndexedDB until it expires, so you stay logged in.
            The session key can’t be exported from the browser.
          </p>
          <Callout kind="warning" title="On a shared device">
            <p>
              Log out when you finish. Start creating a link, go to the review step and choose{" "}
              <strong>Change</strong> next to the account, or clear this site’s data.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "gas",
      title: "Who pays gas",
      keywords: "fees sponsor sponsored transaction network fee",
      body: (
        <>
          <DataTable
            label="Who pays gas"
            head={["Action", "Paid by"]}
            rows={[
              ["Create a link", "The sender"],
              ["Claim a link, with Google or a wallet", "Floe’s sponsor, through Enoki"],
              ["Refund a link", "The sender"],
              ["Send money on as a new link", "Whoever sends it"],
            ]}
          />
          <p>
            Sponsorship depends on the site’s Enoki budget. If it runs out, claims fail with a message
            to try again and the money stays in its escrow.
          </p>
        </>
      ),
    },
    {
      id: "sponsor-rules",
      title: "What the sponsor will pay for",
      keywords: "allowedMoveCallTargets allowedAddresses simulation abuse",
      body: (
        <ul>
          <li>
            Exactly one command, a call to this deployment’s <code>escrow::claim_escrow</code>
          </li>
          <li>Only if a simulation shows that the claim will succeed</li>
          <li>Transfers only to the claimant and the water treasury</li>
        </ul>
      ),
    },
    {
      id: "stale",
      title: "Stale sponsor details",
      body: (
        <p>
          Enoki’s sponsor address or the gas price can change between building and sending. The server
          then answers with the code <code>stale</code>, and the claim page rebuilds and asks for a
          signature again, once.
        </p>
      ),
    },
  ],
};
