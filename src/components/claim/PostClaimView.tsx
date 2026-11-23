"use client";

import Link from "next/link";
import { CheckCircle2, ArrowUpRight, Copy, Check, Droplets, ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { formatCurrency, maskAddress } from "@/lib/utils";

interface PostClaimViewProps {
  amountUsd: number;
  recipientAddress: string;
  txDigest: string;
  hasWaterDonation: boolean;
}

export function PostClaimView({
  amountUsd,
  recipientAddress,
  txDigest,
  hasWaterDonation,
}: PostClaimViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(recipientAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-mist/50 p-6 sm:p-8 space-y-6 text-center shadow-card">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <span className="inline-flex items-center text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Settled in 410 ms · zkLogin Verified
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light mt-2 tracking-[-0.03em]">
          {formatCurrency(amountUsd, "USD")} is now yours!
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Your funds are locked in your private Sui account with zero custody by Floe.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-4 rounded-2xl bg-snow border border-mist/40 text-left space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">Your Sui Address:</span>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="flex items-center gap-1.5 font-mono text-ink font-medium hover:text-ink-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded px-1.5 py-0.5"
            aria-label="Copy Sui address"
          >
            <span>{maskAddress(recipientAddress)}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">Transaction ID:</span>
          <span className="font-mono text-ink-muted truncate max-w-[150px]">
            {txDigest}
          </span>
        </div>

        {hasWaterDonation && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-mist/20">
            <span className="text-sky-800 font-medium flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
              Lofi Clean Water
            </span>
            <span className="font-semibold text-sky-700">10 Gallons Filtered 💧</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          href="/send"
          className="w-full btn-primary py-4 rounded-full min-h-[48px] text-sm font-medium shadow-subtle hover:scale-[1.01] active:scale-[0.97]"
        >
          <span>Send Money to a Friend</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard"
            className="w-full btn-secondary py-3 rounded-full min-h-[44px] text-xs sm:text-sm font-medium"
          >
            Keep in Account
          </Link>
          <a
            href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-secondary py-3 rounded-full min-h-[44px] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <span>View Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
