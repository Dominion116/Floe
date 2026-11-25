import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NETWORK } from "@/lib/chain/config";

const FAQS = [
  {
    question: "Is this safe?",
    answer:
      "Floe never holds your money or the key to it. The key sits after the # in your link, which Floe’s server never receives. Anyone with the full link can claim it, so send it privately." +
      (NETWORK === "testnet"
        ? " This is hackathon software on Sui Testnet, where coins have no real value, and the contract hasn’t been audited."
        : " The contract hasn’t been audited."),
  },
  {
    question: "What if the link expires or goes to the wrong person?",
    answer:
      "Links last 14 days. While a link is unclaimed, open your dashboard and choose “Cancel & refund”. The escrow closes and the money returns to your wallet.",
  },
  {
    question: "Can I add a card, a photo or a voice note?",
    answer:
      "Yes, one for each link. It’s encrypted in your browser and stored on Walrus, and opens after the claim. Anyone with the full link can open it, and it can’t be deleted, so choose with care.",
  },
  {
    question: "How do they get the money out?",
    answer:
      "On their account page they can withdraw to any Sui address, or send it on as a new link. Withdrawing uses a little of their SUI for the network fee.",
  },
  {
    question: "Who pays the gas fees?",
    answer:
      "Floe sponsors claims through Enoki, so your recipient doesn’t need any crypto. You pay a small network fee to create or refund a link.",
  },
  {
    question: "Which tokens are supported?",
    answer:
      "SUI today, with $LOFI to follow on mainnet. Amounts show in dollars at the live price, and the link holds the token.",
  },
  {
    question: "How can someone claim without a wallet?",
    answer:
      "They log in with Google. Sui zkLogin turns that login into a Sui account without putting their email or identity onchain.",
  },
  {
    question: "Login doesn’t work inside a chat app. What now?",
    answer:
      "Google blocks logging in from some in-app browsers. Use “Copy link” on the claim page, then paste it into Safari or Chrome.",
  },
];

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="section-padding bg-white">
      <div className="container-standard">
        <SectionHeader
          id="faq-heading"
          title="Questions people ask first"
          lede="Short answers on safety, refunds, gifts and fees."
        />

        <Reveal>
          <div className="divide-y divide-mist/70 border-y border-mist/70">
            {FAQS.map((faq, idx) => (
              <details key={faq.question} name="faq" open={idx === 0} className="group">
                <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-serif text-xl font-normal tracking-[-0.015em] text-ink">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="max-w-[68ch] pb-6 text-base leading-relaxed text-ink-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
