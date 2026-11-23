"use client";

import type { ReactNode } from "react";
import { Droplet, ExternalLink } from "lucide-react";
import { LiveValue } from "@/components/ui/LiveValue";
import { explorerAccountUrl, explorerTxUrl } from "@/lib/chain/config";
import { fromUnits } from "@/lib/chain/escrow";
import type { PaymentLinkRecord } from "@/lib/types";
import { cn, formatCurrency, formatTimeRemaining, maskAddress } from "@/lib/utils";

interface LinkCardProps {
  link: PaymentLinkRecord;
  onClawbackClick: (link: PaymentLinkRecord) => void;
}

const STATUS = {
  creating: { label: "Confirming", className: "bg-mist-light text-ink-muted" },
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
  const held = fromUnits(link.amountUnits);
  const isOpen = link.status === "pending" || link.status === "expired";

  const details: { label: string; value: ReactNode }[] = [];
  if (link.currency === "USD") {
    details.push({ label: "Sent as", value: formatCurrency(link.enteredAmount) });
  }
  if (isOpen) {
    details.push({ label: "Value now", value: <LiveValue amount={held} currency={link.token} /> });
  }
  details.push({ label: "Created", value: formatDate(link.createdAt) });
  if (link.status === "pending") {
    details.push({ label: "Expires", value: formatTimeRemaining(link.expiresAt) });
  }
  if (link.status === "expired") {
    details.push({ label: "Expired", value: formatDate(link.expiresAt) });
  }
  if (link.status === "claimed" && link.closedAt) {
    details.push({ label: "Claimed", value: formatDateTime(link.closedAt) });
  }
  if (link.status === "reclaimed" && link.closedAt) {
    details.push({ label: "Refunded", value: formatDateTime(link.closedAt) });
  }
  if (link.claimedBy) {
    details.push({
      label: "Claimed by",
      value: (
        <a
          href={explorerAccountUrl(link.claimedBy)}
          target="_blank"
          rel="noopener noreferrer"
          className="link font-mono text-[13px]"
        >
          {maskAddress(link.claimedBy)}
        </a>
      ),
    });
  }

  return (
    <article className="card flex min-w-0 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="type-figure min-w-0 text-3xl [overflow-wrap:anywhere]">
          {formatCurrency(held, link.token)}
        </h2>
        <span className={cn("badge shrink-0", status.className)}>{status.label}</span>
      </div>
      {link.recipientNote && (
        <p className="mt-2 text-base text-ink [overflow-wrap:anywhere]">{link.recipientNote}</p>
      )}
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
        {isOpen && (
          <>
            <p className="type-help mb-3">
              {link.status === "expired"
                ? "Nobody claimed this in time. Refund it to get the money back."
                : "Floe doesn’t keep the private link. If you lost it, refund this one and create another."}
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

        {link.status === "creating" && (
          <p className="type-help">
            Waiting for Sui to confirm this payment. It disappears if it was never sent.
          </p>
        )}

        {(link.status === "claimed" || link.status === "reclaimed") && (
          <a
            href={explorerTxUrl(link.digest)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-secondary w-full"
          >
            <span>View payment on explorer</span>
            <ExternalLink aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
