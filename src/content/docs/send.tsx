import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const send: DocPage = {
  slug: "send",
  file: "send.tsx",
  title: "Send a link",
  description: "Create a payment link in four steps, and share it without putting the money at risk.",
  sections: [
    {
      id: "before-you-start",
      title: "Before you start",
      body: (
        <>
          <p>
            Choose <strong>Create link</strong> anywhere on the site. You pay from a Sui wallet or
            from your Google account. Either one needs enough SUI for the
            amount, the optional roundup and a small network fee.
          </p>
          <p>
            Use a browser that allows site storage. Floe saves a record of the payment before sending
            it, so you can always refund. If storage is blocked, nothing is sent.
          </p>
        </>
      ),
    },
    {
      id: "steps",
      title: "Create the link",
      body: <p>The window walks through four steps. An unfinished draft stays if you close it.</p>,
      children: [
        {
          id: "amount",
          title: "1. Choose an amount",
          keywords: "keypad usd sui currency limit decimals",
          body: (
            <>
              <p>
                Type an amount or pick 5, 20 or 50. You can enter dollars or SUI, with up to two
                decimal places. On mainnet, $LOFI appears as a third choice.
              </p>
              <p>
                Dollar amounts are paid in SUI. Floe converts at the live price when you create the
                link, and the escrow holds that many SUI from then on. See{" "}
                <A href="/docs/prices">Prices and tokens</A>.
              </p>
            </>
          ),
        },
        {
          id: "personalize",
          title: "2. Make it personal",
          keywords: "theme envelope note roundup",
          body: (
            <>
              <p>
                Pick one of four envelopes: Yeti Glacial, Coffee Chill, Birthday Pop or Clean Water
                Blue. Add a note of up to 60 characters. If you leave it blank, the recipient sees “A
                gift for you”.
              </p>
              <p>
                You can also add a <A href="/docs/gifts">photo or a voice note</A>.
              </p>
              <p>
                The <A href="/docs/water">10¢ water roundup</A> is on by default. Turn it off here if
                you don’t want it.
              </p>
            </>
          ),
        },
        {
          id: "review",
          title: "3. Check and pay",
          body: (
            <p>
              Check what they receive, the live price and your total. Connect the account to pay
              from, choose <strong>Create payment link</strong> and approve the transaction in your
              wallet.
            </p>
          ),
        },
        {
          id: "share",
          title: "4. Share the link",
          keywords: "whatsapp telegram imessage qr copy download",
          body: (
            <>
              <p>
                Copy the link, open it in WhatsApp, Telegram, iMessage or an X message, or download
                the QR code for someone next to you.
              </p>
              <Callout kind="warning" title="Save the link before you close the window">
                <p>
                  Floe keeps no copy of the key, so the link can’t be shown again. If you lose it,
                  refund the payment and create a new one.
                </p>
              </Callout>
            </>
          ),
        },
      ],
    },
    {
      id: "share-safely",
      title: "Share it safely",
      body: (
        <>
          <p>
            Treat the link like cash. Whoever opens it first can claim the money, and nobody can
            reverse a claim.
          </p>
          <ul>
            <li>Send it to one person, in a private conversation.</li>
            <li>Never post it publicly or put it in a shared document.</li>
            <li>
              Don’t use a link shortener. The shortener would learn the key, and some drop the part
              after the <code>#</code>.
            </li>
            <li>
              The app you send it through can see the whole link, unless that app encrypts messages
              end to end. The WhatsApp, Telegram and X buttons pass the link to those companies’
              sites. To limit that, copy the link and paste it yourself.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "if-something-goes-wrong",
      title: "If something goes wrong",
      keywords: "couldn't confirm payment check again charged twice failed",
      body: (
        <DataTable
          label="Problems while creating a link"
          head={["What you see", "What it means", "What to do"]}
          rows={[
            [
              "We couldn’t confirm the payment",
              "It was signed, but Sui didn’t answer in time.",
              "Choose Check again. It resends the same signed payment, which Sui can run only once.",
            ],
            [
              "The payment failed",
              "Sui rejected the transaction. No money was locked.",
              "Check your balance and try again.",
            ],
            [
              "Live prices are unavailable",
              "The total can’t be worked out.",
              "Wait a moment and try again.",
            ],
            [
              "The wallet doesn’t have enough",
              "The balance doesn’t cover the amount and the network fee.",
              "Add SUI, or send less.",
            ],
            ["The request was cancelled", "The wallet prompt was closed.", "Approve it to continue."],
          ]}
        />
      ),
    },
  ],
};
