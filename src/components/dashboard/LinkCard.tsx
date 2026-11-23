"use client";

import { useState } from "react";
import { PaymentLinkRecord } from "@/lib/types";
import { formatCurrency, formatTimeRemaining, maskAddress } from "@/lib/utils";
import { Copy, Check, ExternalLink, Clock, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { buildClaimUrl } from "@/lib/crypto";

interface LinkCardProps {
  link: PaymentLinkRecord;
  onClawbackClick: (link: PaymentLinkRecord) => void;
}

export function LinkCard({ link, onClawbackClick }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  const fullClaimUrl = buildClaimUrl(
    baseUrl,
    link.id,
    link.ephemeralPrivateKey
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(fullClaimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    claimed: {
      label: "Claimed",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    },
    expired: {
      label: "Expired",
      className: "bg-gray-100 text-gray-700 border-gray-300",
      dot: "bg-gray-400",
    },
    reclaimed: {
      label: "Reclaimed",
      className: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-400",
    },
  }[link.status];

  return (
    <div className="bg-white rounded-2xl border border-mist/50 p-5 shadow-2xs hover:shadow-subtle transition-all flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-light text-ink tracking-[-0.03em]">
              {formatCurrency(link.amountUsd, link.currency)}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${statusConfig.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} aria-hidden="true" />
              <span>{statusConfig.label}</span>
            </span>
          </div>
          {link.recipientNote && (
            <p className="text-xs text-ink-muted italic mt-1">
              &ldquo;{link.recipientNote}&rdquo;
            </p>
          )}
        </div>

        {link.hasWaterDonation && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            💧 10¢ Water
          </span>
        )}
      </div>

      {/* Status Details */}
      <div className="p-3 rounded-xl bg-snow border border-mist/30 text-xs font-mono space-y-1 text-ink-muted">
        <div className="flex justify-between">
          <span>Escrow ID:</span>
          <span className="text-ink truncate max-w-[120px]">{link.id}</span>
        </div>

        {link.status === "pending" && (
          <div className="flex justify-between items-center text-amber-700">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Safety Timeout:</span>
            </span>
            <span className="font-semibold">
              {formatTimeRemaining(link.expiresAt)}
            </span>
          </div>
        )}

        {link.status === "claimed" && (
          <div className="flex justify-between items-center text-emerald-800">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              <span>Claimed by:</span>
            </span>
            <span className="font-semibold">
              {link.claimedByMasked || "0x892a...c01f"}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {link.status === "pending" && (
          <>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl text-xs font-medium transition-all min-h-[40px] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-ink text-white hover:bg-ink-soft shadow-subtle"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onClawbackClick(link)}
              className="py-2.5 px-3.5 rounded-xl text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors min-h-[40px] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              Cancel & Refund
            </button>
          </>
        )}

        {link.status === "claimed" && (
          <a
            href={fullClaimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl text-xs font-medium bg-snow hover:bg-mist-light border border-mist/50 text-ink transition-colors min-h-[40px] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span>View Claim Page</span>
            <ExternalLink className="w-3 h-3 text-ink-muted" aria-hidden="true" />
          </a>
        )}

        {(link.status === "expired" || link.status === "reclaimed") && (
          <span className="text-xs font-mono text-ink-muted italic py-1">
            Escrow settled and balance returned.
          </span>
        )}
      </div>
    </div>
  );
}
