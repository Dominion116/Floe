"use client";

import { motion } from "framer-motion";
import { CARD_THEMES } from "@/lib/themes";
import { CardThemeId } from "@/lib/types";
import { Droplet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EnvelopeCardProps {
  amountUsd: number;
  currency?: "USD" | "SUI" | "LOFI";
  recipientNote?: string;
  themeId?: CardThemeId;
  hasWaterDonation?: boolean;
}

export function EnvelopeCard({
  amountUsd,
  currency = "USD",
  recipientNote = "Here is a gift for you!",
  themeId = "glacial",
  hasWaterDonation = true,
}: EnvelopeCardProps) {
  const theme = CARD_THEMES[themeId] || CARD_THEMES.glacial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl p-8 sm:p-10 border border-frost/60 bg-gradient-to-br ${theme.bgGradient} shadow-card text-center relative overflow-hidden`}
    >
      {/* Water impact pill if enabled */}
      {hasWaterDonation && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-sky-200 text-sky-800 text-xs font-mono mb-4">
          <Droplet className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
          <span>10 Gallons Ocean Water Funded</span>
        </div>
      )}

      {/* Real Sender Avatar & Title */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
          alt="Alex (Sender)"
          className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs"
        />
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">
          Payment Envelope from Alex
        </p>
      </div>

      {/* Large Amount */}
      <div className="text-6xl sm:text-7xl font-serif font-light text-ink my-3 tracking-[-0.03em]">
        {formatCurrency(amountUsd, currency)}
      </div>

      {/* Note */}
      {recipientNote && (
        <div className="max-w-xs mx-auto py-2.5 px-4 rounded-xl bg-white/70 border border-mist/30 mt-2">
          <p className="text-xs sm:text-sm text-ink italic font-normal">
            &ldquo;{recipientNote}&rdquo;
          </p>
        </div>
      )}

      <div className="pt-6 mt-6 border-t border-mist/30 flex items-center justify-center gap-4 text-[11px] font-mono text-ink-muted">
        <span>Verified Escrow on Sui</span>
        <span>•</span>
        <span>Sponsored Gas ($0.00)</span>
      </div>
    </motion.div>
  );
}
