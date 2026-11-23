"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Is Floe safe? Can a server or hacker steal my funds?",
    answer:
      "Floe is completely non-custodial. When you create a link, the ephemeral private key is stored exclusively in the URL hash fragment (#). Standard web standards dictate that URL fragments are parsed on your device and are never sent to web servers or CDN proxies. Only someone with the exact link can unlock the funds.",
  },
  {
    question: "What happens if my friend never opens the link or it's sent to the wrong person?",
    answer:
      "Every Floe payment escrow comes with a configurable safety timeout (default: 14 days). If the link is unclaimed or sent by mistake, you can simply open your Sender Dashboard and tap 'Cancel & Refund'. The Move smart contract will immediately cancel the escrow and return 100% of the funds to your wallet.",
  },
  {
    question: "Who pays the gas fees for the receiver?",
    answer:
      "Floe sponsors 100% of recipient claim gas transactions using Sui Sponsored Transactions and Enoki Gas Station. Your recipient does not need to own SUI tokens or have any crypto in their account to claim.",
  },
  {
    question: "Which tokens can I send with Floe?",
    answer:
      "Floe supports native SUI, the $LOFI hackathon token, and standard Sui Coin types. Amounts are displayed in USD fiat by default with automatic real-time rate conversion.",
  },
  {
    question: "How does zkLogin work for someone who doesn't know crypto?",
    answer:
      "Sui zkLogin uses zero-knowledge cryptography to connect OpenID Connect (OIDC) providers like Google or Apple to a deterministic Sui address. The user simply taps 'Continue with Google', logs in as they would on any website, and an address is derived mathematically without exposing their personal email or identity on-chain.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="py-20 md:py-28 lg:py-32 bg-white border-t border-mist/30"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 md:mb-20 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mist-light text-ink text-xs font-mono uppercase tracking-widest">
            Clarity & Security
          </div>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink tracking-[-0.03em] leading-tight"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-normal">
            Simple answers to common questions about non-custodial link transfers.
          </p>
        </motion.div>

        {/* FAQ Accordion with Staggered Scroll Animation */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const headingId = `faq-title-${idx}`;
            const panelId = `faq-panel-${idx}`;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="border border-mist/50 rounded-2xl overflow-hidden bg-white hover:border-mist transition-colors shadow-2xs"
              >
                <button
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink transition-colors"
                >
                  <span className="font-serif text-lg md:text-xl text-ink font-normal pr-4 tracking-[-0.015em]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={headingId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-ink-muted leading-relaxed border-t border-mist/20 font-normal">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
