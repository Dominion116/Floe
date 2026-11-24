import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Rates } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The rate the app uses: a 10¢ roundup funds 10 gallons. */
export const GALLONS_PER_USD = 100;

export function usdToToken(usd: number, rate: number): number {
  return parseFloat((usd / rate).toFixed(4));
}

/** Dollar value of an amount in any supported currency. Null while the price is unknown. */
export function toUsd(
  amount: number,
  currency: "USD" | "SUI" | "LOFI",
  rates: Rates | null
): number | null {
  if (currency === "USD") return amount;
  return rates ? amount * rates[currency] : null;
}

export function formatCurrency(amount: number, currency: 'USD' | 'SUI' | 'LOFI' = 'USD'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${currency}`;
}

export function approxUsd(usd: number): string {
  return usd > 0 && usd < 0.01 ? "Less than $0.01" : `About ${formatCurrency(usd)}`;
}

/** "1 SUI = $0.6764". Four significant digits, since $LOFI trades well below a cent. */
export function formatRate(token: "SUI" | "LOFI", rate: number): string {
  return `1 ${token} = $${rate.toLocaleString("en-US", { maximumSignificantDigits: 4 })}`;
}

export function maskAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatTimeRemaining(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}
