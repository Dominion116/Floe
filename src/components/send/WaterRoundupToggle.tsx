"use client";

import { Droplets, Check } from "lucide-react";

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle(!enabled);
    }
  };

  return (
    <div
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onClick={() => onToggle(!enabled)}
      onKeyDown={handleKeyDown}
      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 min-h-[64px] ${
        enabled
          ? "border-sky-300 bg-sky-50/50"
          : "border-mist/50 bg-white hover:border-mist"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
            enabled ? "bg-sky-500 text-white" : "bg-mist-light text-ink-muted"
          }`}
          aria-hidden="true"
        >
          <Droplets className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-ink">
              💧 Round up +${donationAmountUsd.toFixed(2)} to Clean Water
            </span>
            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-[10px] font-mono text-sky-800">
              Lofi Mission
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Atomically cleans 10 gallons of ocean water via on-chain treasury.
          </p>
        </div>
      </div>

      {/* Switch representation */}
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ml-2 ${
          enabled
            ? "bg-sky-500 border-sky-600 text-white"
            : "border-mist/60 bg-snow text-transparent"
        }`}
        aria-hidden="true"
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
    </div>
  );
}
