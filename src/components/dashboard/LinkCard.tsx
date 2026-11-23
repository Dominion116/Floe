"use client";

import { Droplet, ExternalLink } from "lucide-react";
import { PaymentLinkRecord } from "@/lib/types";
import { cn, entryAmount, formatCurrency, formatTimeRemaining } from "@/lib/utils";

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
  const status = STATUS[link.status];

  const details = [{ label: "Created", value: formatDate(link.createdAt) }];
  if (link.currency !== "USD") {
    details.unshift({ label: "Value", value: `About ${formatCurrency(link.amountUsd)}` });
  }
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
          {formatCurrency(entryAmount(link), link.currency)}
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
          <>
            <p className="type-help mb-3">
              Floe doesn’t keep the private link. If you lost it, refund this one and create
              another.
            </p>
            <button
              type="button"
              onClick={() => onClawbackClick(link)}
              className="btn btn-sm btn-secondary w-full"
            >
              Cancel & refund
            </button>
          </>
        )}

        {link.status === "claimed" && (
          <a
            href={`/claim?id=${encodeURIComponent(link.id)}`}
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
