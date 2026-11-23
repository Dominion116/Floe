"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { StatCard } from "@/components/ui/StatCard";
import { fromUnits } from "@/lib/chain/escrow";
import type { PaymentLinkRecord } from "@/lib/types";
import { useLinks } from "@/lib/useLinks";
import { usePrices } from "@/lib/usePrices";
import { cn, formatCurrency, toUsd } from "@/lib/utils";

// Wallets exist only in the browser.
const ClawbackModal = dynamic(() => import("@/components/dashboard/ClawbackModal"), {
  ssr: false,
});

type Tab = "all" | "pending" | "claimed" | "closed";

/** Drives both the tab counts and the list, so they always agree. */
const matchesTab = (link: PaymentLinkRecord, tab: Tab) =>
  tab === "all" ||
  (tab === "closed"
    ? link.status === "expired" || link.status === "reclaimed"
    : tab === "pending"
      ? link.status === "pending" || link.status === "creating"
      : link.status === tab);

const EMPTY_COPY: Record<Tab, string> = {
  all: "You haven’t created a link yet",
  pending: "No links are waiting to be claimed",
  claimed: "None of your links have been claimed yet",
  closed: "None of your links have expired or been refunded",
};

export default function DashboardPage() {
  const { links, status: syncStatus, refresh } = useLinks();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [clawbackLink, setClawbackLink] = useState<PaymentLinkRecord | null>(null);
  const [hasOpenedClawback, setHasOpenedClawback] = useState(false);

  const openClawback = (link: PaymentLinkRecord) => {
    setHasOpenedClawback(true);
    setClawbackLink(link);
  };

  const filteredLinks = links.filter((link) => matchesTab(link, activeTab));

  // Calculate summary metrics
  const { rates, status: ratesStatus } = usePrices(links.length > 0);
  // Null when the tokens can't be valued, so the total is never silently wrong.
  const totalVolumeUsd = links.reduce<number | null>((sum, l) => {
    const usd = toUsd(fromUnits(l.amountUnits), l.token, rates);
    return sum === null || usd === null ? null : sum + usd;
  }, 0);
  const totalNote =
    totalVolumeUsd === null
      ? ratesStatus === "loading"
        ? "Checking live prices…"
        : "Live prices unavailable"
      : links.length === 0
        ? "No links yet"
        : `${links.length} ${links.length === 1 ? "link" : "links"}, at live prices`;
  const pendingCount = links.filter((l) => matchesTab(l, "pending")).length;
  const claimedCount = links.filter((l) => l.status === "claimed").length;
  // The treasury is paid when a link is claimed, so only those count.
  const waterFundedGallons =
    links.filter((l) => l.hasWaterDonation && l.status === "claimed").length * 10;

  const tabs = (
    [
      { id: "all", label: "All" },
      { id: "pending", label: "Pending" },
      { id: "claimed", label: "Claimed" },
      { id: "closed", label: "Expired or refunded" },
    ] as const
  ).map((tab) => ({ ...tab, count: links.filter((l) => matchesTab(l, tab.id)).length }));

  return (
    <PageShell>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-headline">Your payment links</h1>
          <p className="type-lede mt-2">See who has claimed, and refund anything unclaimed.</p>
        </div>
        <CreateLinkButton className="btn btn-primary shrink-0">
          <Plus aria-hidden="true" />
          <span>Create a payment link</span>
        </CreateLinkButton>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-10 lg:grid-cols-4">
        <StatCard
          label="Total sent"
          value={totalVolumeUsd === null ? "—" : formatCurrency(totalVolumeUsd)}
          note={totalNote}
        />
        <StatCard label="Pending" value={String(pendingCount)} note="Waiting to be claimed" />
        <StatCard label="Claimed" value={String(claimedCount)} note="Received" />
        <StatCard
          label="Water funded"
          value={`${waterFundedGallons} gal`}
          note="From claimed links"
        />
      </dl>

      <div
        role="tablist"
        aria-label="Filter payment links by status"
        className="-mx-4 mt-10 flex gap-1 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0 [scrollbar-width:none]"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="links-grid"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "btn btn-sm shrink-0 whitespace-nowrap px-3 sm:px-4",
              activeTab === tab.id ? "bg-mist-light text-ink" : "btn-ghost"
            )}
          >
            {tab.label}
            <span className="tabular-nums text-ink-muted">{tab.count}</span>
          </button>
        ))}
      </div>

      {syncStatus === "failed" && (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-2xl bg-warning-fill px-4 py-3 text-sm text-warning sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Unable to reach Sui, so these statuses may be out of date.</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="btn btn-sm btn-secondary shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      <div id="links-grid" role="tabpanel" aria-label="Payment links list" className="mt-4">
        {filteredLinks.length === 0 ? (
          <div className="well flex flex-col items-center px-6 py-16 text-center">
            <h2 className="type-title">{EMPTY_COPY[activeTab]}</h2>
            <p className="mt-2 max-w-sm text-base text-ink-muted">
              Create a link, share it, and track it here.
            </p>
            <CreateLinkButton className="btn btn-secondary mt-6">
              Create a payment link
            </CreateLinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.digest}
                link={link}
                onClawbackClick={openClawback}
              />
            ))}
          </div>
        )}
      </div>

      {hasOpenedClawback && (
        <ClawbackModal
          link={clawbackLink}
          onClose={() => setClawbackLink(null)}
          onChanged={() => void refresh()}
        />
      )}
    </PageShell>
  );
}
