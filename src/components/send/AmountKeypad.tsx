"use client";

import { Delete } from "lucide-react";
import { cn, formatCurrency, toUsd, usdToSui } from "@/lib/utils";

interface AmountKeypadProps {
  amountStr: string;
  currency: "USD" | "SUI" | "LOFI";
  error?: string | null;
  onChangeAmount: (val: string) => void;
  onToggleCurrency: (curr: "USD" | "SUI" | "LOFI") => void;
}

const CURRENCIES = [
  { id: "USD", label: "USD" },
  { id: "SUI", label: "SUI" },
  { id: "LOFI", label: "$LOFI" },
] as const;

const PRESETS = [5, 20, 50];

export function AmountKeypad({
  amountStr,
  currency,
  error,
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

  // Hardware keyboards and paste. inputMode="none" keeps the phone keyboard closed.
  const handleTyped = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "").replace(/^0+(?=\d)/, "");
    if (cleaned === "") {
      onChangeAmount("0");
    } else if (cleaned.length <= 7 && /^\d*(\.\d{0,2})?$/.test(cleaned)) {
      onChangeAmount(cleaned.startsWith(".") ? `0${cleaned}` : cleaned);
    }
  };

  const usdValue = toUsd(parseFloat(amountStr) || 0, currency);
  const keyClass =
    "h-12 rounded-2xl bg-snow hover:bg-mist-light active:bg-mist-light text-xl text-ink tabular-nums flex items-center justify-center transition-colors duration-150";

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="sr-only">Currency</legend>
        <div className="mx-auto grid w-full max-w-[17.5rem] grid-cols-3 gap-1 rounded-full bg-mist-light p-1">
          {CURRENCIES.map(({ id, label }) => (
            <label
              key={id}
              className={cn(
                "flex min-h-[40px] cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                currency === id ? "bg-white text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              <input
                type="radio"
                name="currency"
                value={id}
                checked={currency === id}
                onChange={() => onToggleCurrency(id)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="text-center">
        <label htmlFor="transfer-amount" className="sr-only">
          Amount in {currency}
        </label>
        <div className="type-figure flex items-baseline justify-center text-6xl sm:text-7xl">
          {currency === "USD" && (
            <span className="text-ink-muted" aria-hidden="true">
              $
            </span>
          )}
          <input
            id="transfer-amount"
            type="text"
            inputMode="none"
            autoComplete="off"
            value={amountStr}
            onChange={(e) => handleTyped(e.target.value)}
            aria-invalid={!!error}
            aria-describedby="transfer-amount-help"
            style={{ width: `${amountStr.length + 0.25}ch` }}
            className="min-w-0 rounded-lg bg-transparent text-center tabular-nums focus-visible:outline-offset-4"
          />
          {currency !== "USD" && (
            <span className="ml-2 font-sans text-xl tracking-normal text-ink-muted" aria-hidden="true">
              {currency}
            </span>
          )}
        </div>
        <p
          id="transfer-amount-help"
          role={error ? "alert" : undefined}
          className={cn("mt-2 text-sm tabular-nums", error ? "text-danger" : "text-ink-muted")}
        >
          {error ??
            (currency === "USD"
              ? `About ${usdToSui(usdValue)} SUI`
              : `About ${formatCurrency(usdValue)}`)}
        </p>
      </div>

      <div className="flex justify-center gap-2" role="group" aria-label="Quick amounts">
        {PRESETS.map((val) => (
          <button
            key={val}
            type="button"
            aria-pressed={amountStr === String(val)}
            onClick={() => onChangeAmount(String(val))}
            className="btn btn-sm btn-secondary tabular-nums aria-pressed:border-ink"
          >
            {currency === "USD" ? `$${val}` : `${val} ${currency}`}
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label="Numeric keypad"
        className="mx-auto grid max-w-[20rem] grid-cols-3 gap-2"
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            aria-label={digit === "." ? "Decimal point" : `Digit ${digit}`}
            className={keyClass}
          >
            {digit}
          </button>
        ))}
        <button type="button" onClick={handleDelete} className={keyClass} aria-label="Delete last digit">
          <Delete className="h-5 w-5 text-ink-muted" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
