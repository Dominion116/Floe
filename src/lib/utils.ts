import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1 SUI = ~2.50 USD (example rate for calculation), 1 LOFI = ~0.05 USD
export const SUI_USD_RATE = 2.50;
export const LOFI_USD_RATE = 0.05;

export function usdToSui(usd: number): number {
  return parseFloat((usd / SUI_USD_RATE).toFixed(4));
}

export function suiToUsd(sui: number): number {
  return parseFloat((sui * SUI_USD_RATE).toFixed(2));
}

/** Dollar value of an amount entered in any supported currency. */
export function toUsd(amount: number, currency: "USD" | "SUI" | "LOFI"): number {
  if (currency === "SUI") return suiToUsd(amount);
  if (currency === "LOFI") return parseFloat((amount * LOFI_USD_RATE).toFixed(2));
  return amount;
}

/** One entered amount, expressed in every currency a link record stores. */
export function convertAmount(
  amount: number,
  currency: "USD" | "SUI" | "LOFI"
): { amountUsd: number; amountSui: number; amountLofi: number } {
  const rate = currency === "SUI" ? SUI_USD_RATE : currency === "LOFI" ? LOFI_USD_RATE : 1;
  const usd = amount * rate;
  return {
    amountUsd: currency === "USD" ? amount : parseFloat(usd.toFixed(2)),
    amountSui: currency === "SUI" ? amount : usdToSui(usd),
    amountLofi: currency === "LOFI" ? amount : parseFloat((usd / LOFI_USD_RATE).toFixed(4)),
  };
}

/** The amount in the currency the sender entered. */
export function entryAmount(link: {
  amountUsd: number;
  amountSui: number;
  amountLofi: number;
  currency: "USD" | "SUI" | "LOFI";
}): number {
  if (link.currency === "SUI") return link.amountSui;
  if (link.currency === "LOFI") return link.amountLofi;
  return link.amountUsd;
}

export function formatCurrency(amount: number, currency: 'USD' | 'SUI' | 'LOFI' = 'USD'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${currency}`;
}

export function maskAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
