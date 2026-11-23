"use client";

import { motion } from "framer-motion";
import { Link2, Share2, Sparkles } from "lucide-react";

export function StepsSection() {
  const steps = [
    {
      step: "01",
      title: "Create",
      subtitle: "Pick an amount and get a private link.",
      description:
        "Input your amount in dollars ($) or SUI. Choose a greeting card theme, add an optional personal note, and generate an encrypted payment link in 5 seconds.",
      icon: Link2,
      badge: "In-memory Ed25519",
      accent: "bg-frost/40 border-frost text-ink",
    },
    {
      step: "02",
      title: "Share",
      subtitle: "Send it on WhatsApp, Telegram, or iMessage.",
      description:
        "Copy your unique URL with one tap or share directly via message apps. The private key lives only in the URL fragment (#), so no intermediate server ever sees it.",
      icon: Share2,
      badge: "Zero Server Knowledge",
      accent: "bg-mist-light border-mist text-ink",
    },
    {
      step: "03",
      title: "Claim",
      subtitle: "Your friend logs in with Google or Apple. Done.",
      description:
        "The receiver opens the link on their phone, authenticates with Google in 1 click, and Sui zkLogin unlocks the funds directly to their new address with zero gas fees.",
      icon: Sparkles,
      badge: "Zero Seed Phrases",
      accent: "bg-emerald-50 border-emerald-200 text-emerald-800",
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="steps-heading"
      className="py-20 md:py-28 lg:py-32 bg-snow border-t border-mist/30"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mist-light text-ink text-xs font-mono uppercase tracking-widest">
            3-Step Architecture
          </div>
          <h2
            id="steps-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink tracking-[-0.03em] leading-tight"
          >
            How sending crypto feels like sending a text
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-normal">
            Floe bridges consumer simplicity with cryptographic non-custodial security. No wallet setup, no network switching, no confusion.
          </p>
        </motion.div>

        {/* 3 Step Cards with Staggered Scroll Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-[28px] p-7 sm:p-8 border border-mist/50 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-light text-ink-muted group-hover:text-ink transition-colors">
                      {item.step}
                    </span>
                    <div className={`p-3 rounded-2xl border ${item.accent}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-serif font-normal text-ink mb-2 tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-ink mb-3 leading-snug">
                    {item.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-mist/20">
                  <span className="inline-block text-[11px] font-mono px-2.5 py-1 rounded-md bg-snow text-ink-muted border border-mist/30">
                    {item.badge}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
