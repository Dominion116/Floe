import { Droplet } from "lucide-react";
import { ThemeIcon } from "@/components/ui/ThemeIcon";
import { CARD_THEMES } from "@/lib/themes";
import { CardThemeId } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface EnvelopeCardProps {
  amountUsd: number;
  currency?: "USD" | "SUI" | "LOFI";
  senderName?: string;
  recipientNote?: string;
  themeId?: CardThemeId;
  hasWaterDonation?: boolean;
  compact?: boolean;
}

export function EnvelopeCard({
  amountUsd,
  currency = "USD",
  senderName,
  recipientNote = "A gift for you",
  themeId = "glacial",
  hasWaterDonation = false,
  compact = false,
}: EnvelopeCardProps) {
  const theme = CARD_THEMES[themeId] || CARD_THEMES.glacial;

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
        {formatCurrency(amountUsd, currency)}
      </p>

      {recipientNote && (
        <p className="mx-auto max-w-xs font-serif text-lg leading-snug text-ink [overflow-wrap:anywhere]">
          “{recipientNote}”
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
