import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";

export const gifts: DocPage = {
  slug: "gifts",
  file: "gifts.tsx",
  title: "Cards, photos and voice",
  description: "Put a yeti card, a photo or a voice note in the envelope. It opens after the money is claimed.",
  sections: [
    {
      id: "add",
      title: "Add one",
      keywords: "yeti card birthday thank you congrats holidays photo picture voice note record microphone attach",
      body: (
        <>
          <p>
            In the second step of <A href="/docs/send#personalize">creating a link</A>, tap a yeti
            card, or choose <strong>Add a photo</strong> or <strong>Record voice</strong>. A link holds
            one gift.
          </p>
          <DataTable
            label="Gift limits"
            head={["Kind", "Limit"]}
            rows={[
              ["Yeti card", "Birthday, Thank you, Congrats or Holidays. Nothing to prepare."],
              ["Photo", "Resized to fit 1,280 pixels. Location and other hidden details are left out."],
              ["Voice note", "30 seconds"],
              ["Size", "Just under 1 MB once prepared"],
            ]}
          />
          <p>
            The gift is encrypted and stored while you check the payment, which usually takes 10 to 20
            seconds. If that fails, you can try again or send without it. No money moves until the gift
            is ready.
          </p>
        </>
      ),
    },
    {
      id: "open",
      title: "Open one",
      keywords: "recipient reveal save download",
      body: (
        <p>
          The envelope says when there’s a gift inside. After claiming, choose{" "}
          <strong>Open your gift</strong>, then save it if you want to keep it. Opening the same link
          again later still offers the gift.
        </p>
      ),
    },
    {
      id: "how-it-works",
      title: "How it works",
      keywords: "walrus encryption aes gcm hkdf blob id publisher aggregator",
      body: (
        <ol>
          <li>
            The browser derives an AES-256 key from the link’s private key with HKDF, and encrypts the
            gift with AES-GCM.
          </li>
          <li>
            It stores the encrypted bytes on{" "}
            <A href="https://docs.wal.app">Walrus</A>, through a public publisher. If one fails, it
            tries the next.
          </li>
          <li>
            The blob ID goes after the <code>#</code> in the link, beside the key and the note. Neither
            Sui nor Floe’s server learns which link has a gift. Yeti cards are ordinary pictures on this
            site, so the server sees one being downloaded, but not the link it goes in.
          </li>
          <li>
            The recipient’s browser downloads the bytes, checks that they haven’t changed and decrypts
            them. Only JPEG photos and MP4 or WebM audio are ever shown.
          </li>
        </ol>
      ),
    },
    {
      id: "limits",
      title: "Know before you send",
      keywords: "privacy delete refund expire public",
      body: (
        <>
          <Callout kind="warning" title="A stored gift can’t be deleted">
            <p>
              Anyone with the full link can open it, even before claiming or after a refund, by using
              the key in the link directly. Don’t send anything you’d need to take back.
            </p>
          </Callout>
          <ul>
            <li>
              The encrypted bytes are public, and their size and upload time can be seen. The content
              can’t be read without the link.
            </li>
            <li>
              Storage is paid for about 20 days on testnet. After that the gift may disappear, so save
              it. Walrus Testnet makes no promise to keep data, and can be reset.
            </li>
            <li>Floe can’t see, check, recover or remove a gift.</li>
            <li>Gifts are available on mainnet only where the site runs its own Walrus publisher.</li>
          </ul>
        </>
      ),
    },
    {
      id: "problems",
      title: "If something goes wrong",
      keywords: "microphone blocked heic couldn't be added no longer available",
      body: (
        <DataTable
          label="Gift problems"
          head={["What you see", "What to do"]}
          rows={[
            ["That card couldn’t be loaded", "Check your connection, then tap it again."],
            ["Couldn’t be added", "Try again, or send without it. Storage services are busy or down."],
            ["Can’t open that photo", "Use a JPEG or PNG. Some browsers can’t read HEIC."],
            ["Allow the microphone", "Allow it in the browser’s site settings, then try again."],
            ["No Record voice button", "This browser can’t record. Try Safari or Chrome."],
            [
              "The gift is no longer available",
              "It expired, was lost or was changed. The money isn’t affected.",
            ],
          ]}
        />
      ),
    },
  ],
};
