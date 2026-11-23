"use client";

import { Droplets } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WaterRoundupToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  donationAmountUsd: number;
}

export function WaterRoundupToggle({
  enabled,
  onToggle,
  donationAmountUsd,
}: WaterRoundupToggleProps) {
  return (
    <label className="option flex items-center gap-3 rounded-2xl p-4">
      <Droplets className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5 text-ink">
          Round up to donate 10¢ to clean ocean water
        </span>
        <span className="type-help block" aria-live="polite">
          {enabled
            ? `Adds ${formatCurrency(donationAmountUsd)} and funds 10 gallons.`
            : "Off. Nothing is added to your total."}
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className="relative h-6 w-10 shrink-0 rounded-full bg-control transition-colors duration-150 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-150 peer-checked:bg-ink peer-checked:after:translate-x-4"
        aria-hidden="true"
      />
    </label>
  );
}
