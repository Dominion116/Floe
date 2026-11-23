import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FAQS = [
  {
    question: "Is this safe?",
    answer:
      "Yes. Floe is non-custodial. The key that unlocks the money sits after the # in your link, and browsers never send that part to a server. Only someone with the full link can claim it.",
  },
  {
    question: "What if the link expires or goes to the wrong person?",
    answer:
      "Links last 14 days. While a link is unclaimed, open your dashboard and choose “Cancel & refund”. The escrow closes and the money returns to your wallet.",
  },
  {
    question: "Who pays the gas fees?",
    answer:
      "Floe sponsors the gas for every claim through Enoki. Your recipient doesn’t need SUI or any other crypto.",
  },
  {
    question: "Which tokens are supported?",
    answer:
      "SUI, $LOFI and standard Sui coins. Amounts show in dollars by default, and you can switch to SUI or $LOFI.",
  },
  {
    question: "How can someone claim without a wallet?",
    answer:
      "They log in with Google or Apple. Sui zkLogin turns that login into a Sui account without putting their email or identity onchain.",
  },
];

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="section-padding bg-white">
      <div className="container-standard">
        <SectionHeader
          id="faq-heading"
          title="Questions people ask first"
          lede="Short answers on safety, refunds, fees and tokens."
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
