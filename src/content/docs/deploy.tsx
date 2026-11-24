import { A, Callout, CodeBlock } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const deploy: DocPage = {
  slug: "deploy",
  file: "deploy.tsx",
  title: "Deploy",
  description: "Publish the contract, connect Google and Enoki, and host the app.",
  sections: [
    {
      id: "publish",
      title: "1. Publish the contract",
      keywords: "sui client publish package id testnet faucet",
      body: (
        <>
          <p>Run the tests first, then publish with an account that has testnet SUI.</p>
          <CodeBlock
            title="Terminal"
            lang="bash"
            code={`cd move
sui move test

sui client switch --env testnet
sui client faucet
sui client publish`}
          />
          <p>
            Copy the package ID from the output into <code>NEXT_PUBLIC_FLOE_PACKAGE_ID</code>.
          </p>
          <Callout title="Decide what to do with the upgrade capability">
            <p>
              Publishing gives your account an <code>UpgradeCap</code>. Whoever holds it can publish
              new versions of the package. Make the package immutable if you want users to rely on the
              code as it is.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "google",
      title: "2. Create a Google OAuth client",
      keywords: "redirect uri consent screen client id",
      body: (
        <>
          <ol>
            <li>In Google Cloud Console, create an OAuth client for a web application.</li>
            <li>Add these authorized redirect URIs:</li>
          </ol>
          <CodeBlock
            title="Redirect URIs"
            code={`http://localhost:3000/auth
https://<your domain>/auth`}
          />
          <ol start={3}>
            <li>
              Copy the client ID into <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
            </li>
            <li>
              On the consent screen, use <code>/privacy</code> and <code>/terms</code> on your domain
              for the policy links, after adapting them to your deployment.
            </li>
          </ol>
          <Callout kind="warning" title="Don’t replace the client ID later">
            <p>
              A zkLogin address depends on it. With a different client ID, people log in to new, empty
              accounts and can’t reach their old ones.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "enoki",
      title: "3. Set up Enoki",
      keywords: "portal api key sponsor allowed move call target budget",
      body: (
        <>
          <p>
            In the <A href="https://enoki.mystenlabs.com">Enoki Portal</A>:
          </p>
          <ol>
            <li>Add your Google client ID.</li>
            <li>
              Create a public key with zkLogin enabled, for <code>NEXT_PUBLIC_ENOKI_API_KEY</code>.
            </li>
            <li>
              Create a private key with sponsored transactions enabled, for{" "}
              <code>ENOKI_SECRET_KEY</code>.
            </li>
            <li>Enable both keys on the network you use.</li>
            <li>
              Allow the call target <code>&lt;package ID&gt;::escrow::claim_escrow</code>.
            </li>
            <li>Check the gas budget.</li>
          </ol>
        </>
      ),
    },
    {
      id: "host",
      title: "4. Host the app",
      keywords: "vercel production https environment variables rate limit",
      body: (
        <>
          <p>
            Import the repository into Vercel, add the{" "}
            <A href="/docs/configuration">environment variables</A> and deploy. Any host that runs
            Next.js 15 with server routes works.
          </p>
          <ul>
            <li>Serve it over HTTPS. Clipboard access and login need it.</li>
            <li>
              Redeploy after changing a <code>NEXT_PUBLIC_</code> variable.
            </li>
            <li>
              <code>/api/claim</code> has no rate limit of its own. Add one at your host, and set a
              budget in Enoki.
            </li>
            <li>
              Think twice before adding analytics or error tracking. A script that records the full
              page address on <code>/claim</code> would capture the key.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "verify",
      title: "5. Try a full payment",
      body: (
        <ol>
          <li>Create a small link from a testnet wallet.</li>
          <li>Open it in a private window and claim it with Google.</li>
          <li>Check that the dashboard shows it as claimed.</li>
          <li>On the account page, withdraw it to another address.</li>
          <li>Create a second link, and refund it.</li>
          <li>
            If the roundup was on, find its transfer to the treasury in the claim transaction.
          </li>
        </ol>
      ),
    },
    {
      id: "mainnet",
      title: "Going to mainnet",
      keywords: "production launch lofi audit",
      body: (
        <ul>
          <li>Have the contract audited.</li>
          <li>
            Decide how people who hold only $LOFI will pay to withdraw it. If you sponsor that, limit it
            so it can’t drain your gas budget.
          </li>
          <li>Publish it on mainnet, and set the network, node and package ID together.</li>
          <li>Create mainnet Enoki keys and fund sponsorship.</li>
          <li>
            Have a lawyer review the <A href="/terms">terms</A> and{" "}
            <A href="/privacy">privacy policy</A> for where you operate. Moving money for other people
            can be regulated.
          </li>
        </ul>
      ),
    },
  ],
};
