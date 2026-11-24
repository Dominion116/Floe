import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { LegalDoc } from "@/content/types";
import { CONTACT_EMAIL, ISSUES_URL, REPO_URL } from "@/lib/site";

export const privacy: LegalDoc = {
  title: "Privacy policy",
  lede: "Floe has no accounts database, no analytics and no ads. This page explains what is stored, what is public on Sui and which services take part in a payment.",
  updated: "November 24, 2026",
  summary: [
    "Floe’s servers don’t receive the key in your link or your note.",
    "Floe doesn’t ask Google for your email, name or photo.",
    "Your link history stays in your browser.",
    "Payments are recorded on Sui, where they are public and permanent.",
    "Google, Enoki, Sui nodes and our host process some data to make payments work.",
  ],
  sections: [
    {
      id: "who-we-are",
      title: "Who this covers",
      body: (
        <>
          <p>
            “Floe”, “we” and “us” mean the maintainers of the Floe project, whose code is at{" "}
            <A href={REPO_URL}>github.com/Dominion116/Floe</A>. This policy covers the website that
            shows it and the API routes that site uses.
          </p>
          <p>
            Anyone can run their own copy of Floe. We don’t control those copies, so check the policy
            of the site you are on.
          </p>
        </>
      ),
    },
    {
      id: "what-we-do-not-collect",
      title: "What we don’t collect",
      body: (
        <ul>
          <li>The private key in a payment link, the note beside it, or a photo or voice gift</li>
          <li>Your Google email, name, photo, contacts or password</li>
          <li>Seed phrases, or the keys of your wallet</li>
          <li>Analytics, advertising identifiers or cross-site tracking</li>
          <li>Cookies. Floe’s own code sets none.</li>
        </ul>
      ),
    },
    {
      id: "on-your-device",
      title: "What is kept on your device",
      body: (
        <>
          <p>This data stays in your browser’s storage unless a row says otherwise.</p>
          <DataTable
            label="Data kept on your device"
            head={["Data", "Why", "Kept until"]}
            rows={[
              [
                "Your link history: amounts, notes, themes, dates, statuses, transaction and escrow IDs, your address and the recipient’s address",
                "To show your dashboard and let you refund",
                "You clear this site’s data",
              ],
              [
                "The last wallet you connected, and its address",
                "To reconnect it next time",
                "You disconnect it, or clear this site’s data",
              ],
              [
                "Your Google login session: an ID token, a session key, a proof and your Sui address",
                "To keep you logged in and sign transactions. Parts are sent to Enoki, as described below.",
                "The session expires, you disconnect, or you clear this site’s data",
              ],
              [
                "A Slush wallet session, if you use Slush on the web",
                "To reach that wallet",
                "You disconnect it, or clear this site’s data",
              ],
            ]}
          />
          <p>
            Your browser may also save the full link in its history, including the key. Other people
            who use the device, or sync its history, could find it.
          </p>
        </>
      ),
    },
    {
      id: "our-server",
      title: "What our server handles",
      body: (
        <>
          <p>
            <strong>Page visits.</strong> Our host receives your IP address, browser type and the
            address you request, as any web host does. On a claim page that address includes the
            escrow ID, but not the key or the note. The host may keep these details in its logs.
          </p>
          <p>
            <strong>Claims.</strong> When you claim, your browser sends us the signed transaction. It
            holds your Sui address, the escrow ID and signatures, all of which become public when the
            claim runs. We pass it to Sui and Enoki. We don’t save it to a database. If sponsorship
            fails, we log the error message.
          </p>
          <p>
            <strong>Prices.</strong> Our server asks for prices on everyone’s behalf, so those
            services don’t learn who you are.
          </p>
        </>
      ),
    },
    {
      id: "public-on-sui",
      title: "What is public on Sui",
      body: (
        <>
          <p>
            Sui is a public blockchain. Balances and withdrawals are public, and for every link anyone
            can see:
          </p>
          <ul>
            <li>The sender’s address</li>
            <li>The amount, token, roundup and envelope theme</li>
            <li>When it was created, when it expires and how it ended</li>
            <li>The recipient’s address, once claimed</li>
            <li>The link’s public key, which can’t be used to claim</li>
          </ul>
          <p>
            The note is not put on chain. Neither is your Google identity, although someone who knows
            that an address is yours can see all its activity.
          </p>
          <Callout kind="warning" title="Blockchain records can’t be erased">
            <p>
              Neither you nor we can change or delete them, and they are copied around the world.
              Please consider this before you send or claim.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "services",
      title: "Other services involved",
      body: (
        <>
          <p>
            These services receive data directly from your browser or from our server. Each has its
            own privacy policy. All of those contacted by your browser can see your IP address.
          </p>
          <DataTable
            label="Other services involved"
            head={["Service", "When", "What it receives"]}
            rows={[
              [
                "Vercel",
                "Hosting, on our own deployment",
                "Web requests, as described above",
              ],
              [
                "Google",
                "You log in",
                "That you are logging in to Floe. We ask for the openid scope only.",
              ],
              [
                "Enoki, by Mysten Labs",
                "You log in with Google or claim",
                "Your Google ID token, which holds a Google account identifier, your session’s public key and the transaction to sponsor",
              ],
              [
                "Sui nodes and GraphQL",
                "Links are loaded, created, claimed, refunded or tracked, or you view or withdraw a balance",
                "The escrow and transaction IDs, addresses and signed transactions involved",
              ],
              [
                "Your wallet, such as Slush",
                "You open a create, claim, refund or account screen",
                "A request for wallet details, then what you ask the wallet to sign",
              ],
              [
                "CoinGecko and DEX Screener",
                "Prices are needed",
                "A request from our server, with nothing about you",
              ],
              [
                "Walrus publishers and aggregators",
                "You add or open a photo or voice gift",
                "The encrypted gift, which they can’t open, and its ID",
              ],
              [
                "Suiscan",
                "You follow an explorer link",
                "The address or transaction you open",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "gifts",
      title: "Photo and voice gifts",
      body: (
        <>
          <p>
            Your browser uses the camera, photos or microphone only when you choose to add a gift, and
            the microphone stops when you finish recording. Photos are redrawn first, which removes
            their location and other hidden details.
          </p>
          <p>
            The gift is encrypted on your device, then stored on Walrus, a public storage network run by
            independent operators. Anyone can download the encrypted bytes and see their size, but
            opening them needs the full link. We can’t open, recover or delete a gift. Storage is paid
            for about 20 days on testnet, and copies may last longer.
          </p>
          <p>
            Get permission before sending a photo or recording of someone else.
          </p>
        </>
      ),
    },
    {
      id: "sharing-links",
      title: "When you share a link",
      body: (
        <>
          <p>
            If you use the WhatsApp, Telegram or X buttons, your browser opens that company’s site
            with the full link in its address. <strong>That includes the key and the note.</strong>{" "}
            The iMessage button hands it to your device’s messaging app. Once you share a link, the
            service that carries it may store it under its own policy.
          </p>
          <p>
            To keep the link away from a company’s web address, copy it and paste it yourself into an
            end-to-end encrypted chat.
          </p>
        </>
      ),
    },
    {
      id: "why-we-use-data",
      title: "Why we use data",
      body: (
        <>
          <p>We use the data described here to:</p>
          <ul>
            <li>Provide what you asked for: creating, showing, claiming and refunding links</li>
            <li>Keep the service working, find faults and prevent abuse of sponsored gas</li>
            <li>Meet legal obligations, where any apply</li>
          </ul>
          <p>
            Where the law asks for a legal basis, we rely on performing the service you requested, our
            legitimate interest in running it safely, and legal obligation. We don’t sell data, use it
            for advertising or make automated decisions about you.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "How long data is kept",
      body: (
        <ul>
          <li>
            <strong>On your device:</strong> until it expires or you remove it, as listed above
          </li>
          <li>
            <strong>In server logs:</strong> for our host’s standard log period
          </li>
          <li>
            <strong>On Sui:</strong> permanently
          </li>
          <li>
            <strong>At other services:</strong> as their policies say
          </li>
        </ul>
      ),
    },
    {
      id: "your-choices",
      title: "Your choices and rights",
      body: (
        <>
          <ul>
            <li>
              Clear this site’s data in your browser to remove your history and log out. Refund open
              links first, or keep a note of their escrow IDs.
            </li>
            <li>
              Log out on <A href="/account">Your account</A>, or choose <strong>Change</strong> next
              to a connected account.
            </li>
            <li>Claim with a wallet instead of Google.</li>
            <li>Remove Floe’s access in your Google account settings.</li>
          </ul>
          <p>
            Depending on where you live, you may have the right to access, correct, delete, restrict
            or object to the use of your personal data, to receive a copy of it, and to complain to a
            data protection authority. We hold very little that identifies you, so we may not be able
            to match a request to a person. We can’t alter data on Sui.
          </p>
        </>
      ),
    },
    {
      id: "international",
      title: "Where data is processed",
      body: (
        <p>
          Our host, the services above and Sui’s nodes operate in many countries, so your data may be
          processed outside your own.
        </p>
      ),
    },
    {
      id: "security",
      title: "Security",
      body: (
        <p>
          Floe is designed so that our servers never need your keys. The{" "}
          <A href="/docs/security">security model</A> explains how, and its limits. No system is
          perfectly secure, and the contract has not been audited.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: (
        <p>
          Floe is for people aged 18 or over. We don’t knowingly collect personal data from children.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          If this policy changes, we’ll update the date at the top. Earlier versions are in the
          project’s public <A href={`${REPO_URL}/commits/main/src/content/legal/privacy.tsx`}>history</A>.
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
          Open an issue on <A href={ISSUES_URL}>GitHub</A>. Issues are public, so don’t include
          personal details or a payment link. Say that your question is private, and we’ll arrange
          another way to talk.
        </p>
      ),
    },
  ],
};
