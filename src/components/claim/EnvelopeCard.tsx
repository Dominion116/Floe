"use client";

import { Droplet, Gift } from "lucide-react";
import { ThemeIcon } from "@/components/ui/ThemeIcon";
import { CARD_THEMES } from "@/lib/themes";
import { CardThemeId } from "@/lib/types";
import { usePrices } from "@/lib/usePrices";
import { cn, formatCurrency, toUsd } from "@/lib/utils";

interface EnvelopeCardProps {
  /** In `currency` */
  amount: number;
  currency?: "USD" | "SUI" | "LOFI";
  senderName?: string;
  recipientNote?: string;
  themeId?: CardThemeId;
  hasWaterDonation?: boolean;
  hasGift?: boolean;
  compact?: boolean;
}

export function EnvelopeCard({
  amount,
  currency = "USD",
  senderName,
  recipientNote = "A gift for you",
  themeId = "glacial",
  hasWaterDonation = false,
  hasGift = false,
  compact = false,
}: EnvelopeCardProps) {
  const theme = CARD_THEMES[themeId] || CARD_THEMES.glacial;
  const { rates } = usePrices(currency !== "USD");
  // Dollars lead. The token amount is the exact one, so it always shows too.
  const usd = currency === "USD" ? null : toUsd(amount, currency, rates);

  return (
    <div
      className={cn(
        "rounded-3xl text-center",
        theme.surfaceClass,
        compact ? "p-5" : "p-6 sm:p-8"
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <ThemeIcon theme={theme} />
        <p className="text-sm font-medium text-ink">
          {senderName ? `${senderName} sent you` : "Someone sent you"}
        </p>
      </div>

      <p
        className={cn(
          "type-figure [overflow-wrap:anywhere]",
          compact ? "my-3 text-4xl" : "my-5 text-5xl sm:text-6xl"
        )}
      >
        {usd === null ? formatCurrency(amount, currency) : formatCurrency(usd)}
      </p>

      {usd !== null && (
        <p className="-mt-2 mb-4 text-sm tabular-nums text-ink/75">
          {formatCurrency(amount, currency)} at the live price
        </p>
      )}

      {recipientNote && (
        <p className="mx-auto max-w-xs font-serif text-lg leading-snug text-ink [overflow-wrap:anywhere]">
          “{recipientNote}”
        </p>
      )}

      {hasGift && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-ink">
          <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
          There’s a gift inside
        </p>
      )}

      {hasWaterDonation && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] leading-5 text-ink/75">
          <Droplet className="h-4 w-4 shrink-0" aria-hidden="true" />
          Funds 10 gallons of clean water
        </p>
      )}
    </div>
  );
}
