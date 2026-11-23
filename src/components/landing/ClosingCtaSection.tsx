"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function ClosingCtaSection() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="py-20 md:py-28 lg:py-32 bg-white border-t border-mist/30"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] bg-ink text-white p-8 sm:p-14 md:p-20 text-center space-y-10 relative overflow-hidden shadow-floating"
        >
          {/* Subtle glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-frost/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          {/* Eyebrow Chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-frost-light"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ready in 5 seconds · Zero Gas</span>
          </motion.div>

          {/* 71UI Playbook I Signature Move: Brightness-Ramp Closing Headline (40% -> 70% -> 100%) */}
          <motion.div
            id="closing-cta-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1 sm:space-y-2 font-serif font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[1.08] max-w-3xl mx-auto"
          >
            <div className="text-white/40">Money should move</div>
            <div className="text-white/70">as fast as thought.</div>
            <div className="text-white">With a single link.</div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-mist text-base sm:text-lg max-w-md mx-auto font-normal leading-relaxed"
          >
            No wallet extensions to install. No 24-word seed phrases to lose. Create and claim in 2 seconds.
          </motion.p>

          {/* 71UI Avatar CTA Pill with Real Portrait Avatars + Secondary Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/send"
              className="inline-flex items-center gap-3.5 px-6 py-3 rounded-full bg-white text-ink hover:bg-frost transition-all duration-150 ease-out shadow-subtle hover:scale-[1.02] active:scale-[0.97] min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {/* Overlapping Real Avatars */}
              <div className="flex -space-x-2.5 overflow-hidden" aria-hidden="true">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Sender Avatar"
                  className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-ink/10"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Recipient Avatar"
                  className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-ink/10"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Friend Avatar"
                  className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-ink/10"
                />
              </div>

              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-ink">
                  Create a payment link
                </span>
                <span className="block text-[10px] font-mono text-ink-muted">
                  Ready in 5 seconds · Zero gas
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="btn-dark-secondary min-h-[48px] px-7"
            >
              <span>View Dashboard</span>
            </Link>
          </motion.div>

          {/* Security & Protocol Badges */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-mist font-mono">
            <span>✓ 100% Non-Custodial Escrow</span>
            <span>✓ Zero Gas for Receivers</span>
            <span>✓ Sui zkLogin Verified</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
