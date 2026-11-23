"use client";

import { useState } from "react";
import { Check, Copy, Droplet, ExternalLink } from "lucide-react";
import { buildClaimUrl } from "@/lib/crypto";
import { PaymentLinkRecord } from "@/lib/types";
import { cn, formatCurrency, formatTimeRemaining } from "@/lib/utils";

interface LinkCardProps {
  link: PaymentLinkRecord;
  onClawbackClick: (link: PaymentLinkRecord) => void;
}

const STATUS = {
  pending: { label: "Pending", className: "bg-warning-fill text-warning" },
  claimed: { label: "Claimed", className: "bg-success-fill text-success" },
  expired: { label: "Expired", className: "bg-mist-light text-ink-muted" },
  reclaimed: { label: "Reclaimed", className: "bg-mist-light text-ink-muted" },
};

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatDateTime = (ms: number) =>
  new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

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

  const status = STATUS[link.status];

  const details = [{ label: "Created", value: formatDate(link.createdAt) }];
  if (link.status === "pending") {
    details.push({ label: "Expires", value: formatTimeRemaining(link.expiresAt) });
  }
  if (link.status === "claimed") {
    if (link.claimedAt) details.push({ label: "Claimed", value: formatDateTime(link.claimedAt) });
    if (link.claimedByMasked) details.push({ label: "Claimed by", value: link.claimedByMasked });
  }
  if (link.status === "expired") {
    details.push({ label: "Expired", value: formatDate(link.expiresAt) });
  }

  return (
    <article className="card flex min-w-0 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="type-figure min-w-0 text-3xl [overflow-wrap:anywhere]">
          {formatCurrency(link.amountUsd, link.currency)}
        </h2>
        <span className={cn("badge shrink-0", status.className)}>{status.label}</span>
      </div>
      <p className="mt-2 text-base text-ink [overflow-wrap:anywhere]">{link.recipientNote}</p>
      {link.hasWaterDonation && (
        <p className="type-help mt-1 flex items-center gap-1.5">
          <Droplet className="h-4 w-4 shrink-0" aria-hidden="true" />
          10¢ to clean water
        </p>
      )}

      <dl className="mt-5 space-y-1.5 text-sm">
        {details.map((d) => (
          <div key={d.label} className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-ink-muted">{d.label}</dt>
            <dd className="min-w-0 text-right tabular-nums text-ink">{d.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-5">
        {link.status === "pending" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-sm btn-secondary flex-1 whitespace-nowrap"
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
            </button>
            <button
              type="button"
              onClick={() => onClawbackClick(link)}
              className="btn btn-sm btn-danger-ghost flex-1 whitespace-nowrap"
            >
              Cancel & refund
            </button>
          </div>
        )}

        {link.status === "claimed" && (
          <a
            href={fullClaimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-secondary w-full"
          >
            <span>View claim page</span>
            <ExternalLink aria-hidden="true" />
          </a>
        )}

        {(link.status === "expired" || link.status === "reclaimed") && (
          <p className="type-help">
            {link.status === "reclaimed"
              ? "Refunded to your wallet."
              : "Not claimed before the link expired."}
          </p>
        )}
      </div>
    </article>
  );
}
