"use client";

import { Delete } from "lucide-react";
import { usdToSui } from "@/lib/utils";

interface AmountKeypadProps {
  amountStr: string;
  currency: "USD" | "SUI" | "LOFI";
  onChangeAmount: (val: string) => void;
  onToggleCurrency: (curr: "USD" | "SUI" | "LOFI") => void;
}

export function AmountKeypad({
  amountStr,
  currency,
  onChangeAmount,
  onToggleCurrency,
}: AmountKeypadProps) {
  const handleDigit = (digit: string) => {
    if (digit === "." && amountStr.includes(".")) return;
    if (amountStr === "0" && digit !== ".") {
      onChangeAmount(digit);
      return;
    }
    // Limit to 2 decimal places if decimal exists
    if (amountStr.includes(".")) {
      const parts = amountStr.split(".");
      if (parts[1] && parts[1].length >= 2) return;
    }
    // Limit maximum length
    if (amountStr.length >= 7) return;
    onChangeAmount(amountStr + digit);
  };

  const handleDelete = () => {
    if (amountStr.length <= 1) {
      onChangeAmount("0");
    } else {
      onChangeAmount(amountStr.slice(0, -1));
    }
  };

  const handlePreset = (preset: number) => {
    onChangeAmount(preset.toString());
  };

  const numericValue = parseFloat(amountStr) || 0;
  const suiValue = usdToSui(numericValue);

  return (
    <div className="space-y-6">
      {/* Display & Currency Toggle */}
      <div className="text-center space-y-2">
        <div
          role="radiogroup"
          aria-label="Select Currency"
          className="inline-flex p-1 rounded-full bg-snow border border-mist/40 text-xs font-mono"
        >
          {(["USD", "SUI", "LOFI"] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              role="radio"
              aria-checked={currency === curr}
              onClick={() => onToggleCurrency(curr)}
              className={`px-3.5 py-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                currency === curr
                  ? "bg-ink text-white shadow-xs font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Large Amount Display */}
        <div className="py-4">
          <div className="flex items-center justify-center font-serif text-6xl sm:text-7xl font-light text-ink tracking-[-0.03em]">
            {currency === "USD" && <span className="text-ink-muted mr-1">$</span>}
            <span>{amountStr}</span>
            {currency !== "USD" && (
              <span className="text-xl sm:text-2xl font-sans text-ink-muted ml-2">
                {currency}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-ink-muted mt-2">
            ≈ {suiValue} SUI · Instant settlement on Sui
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-center gap-2">
          {[5, 10, 25, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handlePreset(val)}
              className="px-4 py-1.5 rounded-full text-xs font-mono bg-white border border-mist/50 text-ink hover:border-ink hover:bg-snow transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[36px]"
            >
              ${val}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric Keypad Grid */}
      <div
        role="group"
        aria-label="Numeric keypad"
        className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2"
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            aria-label={digit === "." ? "Decimal point" : `Digit ${digit}`}
            className="h-14 rounded-2xl bg-white border border-mist/40 hover:border-mist hover:bg-snow font-mono text-xl text-ink font-medium transition-all active:scale-[0.96] shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-white border border-mist/40 hover:border-mist hover:bg-snow flex items-center justify-center text-ink transition-all active:scale-[0.96] shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          aria-label="Backspace"
        >
          <Delete className="w-5 h-5 text-ink-muted" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
