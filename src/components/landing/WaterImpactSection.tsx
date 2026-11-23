"use client";

import { motion } from "framer-motion";
import { Droplets, Waves, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function WaterImpactSection() {
  return (
    <section
      aria-labelledby="water-impact-heading"
      className="py-20 md:py-28 lg:py-32 bg-snow border-t border-mist/30 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-br from-[#EBF7F9] via-white to-[#D5EFF4] rounded-[32px] p-8 sm:p-12 md:p-16 border border-[#9EE0ED]/60 shadow-subtle relative overflow-hidden"
        >
          {/* Subtle water wave background icon */}
          <Waves className="absolute -right-10 -bottom-10 w-72 h-72 text-sky-200/40 pointer-events-none -rotate-12" aria-hidden="true" />

          <div className="max-w-2xl relative z-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-sky-200 text-sky-800 text-xs font-mono"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
              <span>Lofi Mission · Clean Ocean Initiative</span>
            </motion.div>

            <motion.h2
              id="water-impact-heading"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink leading-tight tracking-[-0.03em]"
            >
              Every 10¢ roundup cleans 10 gallons of ocean water.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-ink-muted leading-relaxed font-normal"
            >
              When creating a Floe link, senders can toggle an optional 10¢ micro-donation. 
              The Move smart contract atomically routes every single cent directly to the Lofi Foundation Clean Water Treasury on Sui.
            </motion.p>

            {/* Impact numbers staggered animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-sky-100"
            >
              <div>
                <span className="font-mono text-3xl sm:text-4xl font-light text-ink">48,290</span>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">Gallons Filtered</p>
              </div>
              <div>
                <span className="font-mono text-3xl sm:text-4xl font-light text-ink">4,829</span>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">Roundups Matched</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="font-mono text-3xl sm:text-4xl font-light text-ink">100%</span>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">On-Chain Verified</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-2"
            >
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono font-medium text-ink hover:text-sky-700 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
              >
                <span>Inspect treasury smart contract live data</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
