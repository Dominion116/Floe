"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CreateLinkButton, useCreateLink } from "@/components/create/CreateLinkProvider";
import { ClawbackModal } from "@/components/dashboard/ClawbackModal";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { StatCard } from "@/components/ui/StatCard";
import { getStoredLinks, updateLinkStatus } from "@/lib/storage";
import { PaymentLinkRecord } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Tab = "all" | "pending" | "claimed" | "closed";

/** Drives both the tab counts and the list, so they always agree. */
const matchesTab = (link: PaymentLinkRecord, tab: Tab) =>
  tab === "all" ||
  (tab === "closed"
    ? link.status === "expired" || link.status === "reclaimed"
    : link.status === tab);

const EMPTY_COPY: Record<Tab, string> = {
  all: "You haven’t created a link yet",
  pending: "No links are waiting to be claimed",
  claimed: "None of your links have been claimed yet",
  closed: "None of your links have expired or been refunded",
};

export default function DashboardPage() {
  const { createdCount } = useCreateLink();
  const [links, setLinks] = useState<PaymentLinkRecord[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [clawbackLink, setClawbackLink] = useState<PaymentLinkRecord | null>(null);

  // Reloads when the create modal saves a link on top of this page.
  useEffect(() => {
    setLinks(getStoredLinks());
  }, [createdCount]);

  const handleConfirmClawback = (id: string) => {
    updateLinkStatus(id, "reclaimed");
    setLinks(getStoredLinks());
  };

  const filteredLinks = links.filter((link) => matchesTab(link, activeTab));

  // Calculate summary metrics
  const totalVolumeUsd = links.reduce((sum, l) => sum + l.amountUsd, 0);
  const pendingCount = links.filter((l) => l.status === "pending").length;
  const claimedCount = links.filter((l) => l.status === "claimed").length;
  const waterFundedGallons =
    links.filter((l) => l.hasWaterDonation).length * 10;

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
          value={formatCurrency(totalVolumeUsd, "USD")}
          note={`${links.length} ${links.length === 1 ? "link" : "links"}`}
        />
        <StatCard label="Pending" value={String(pendingCount)} note="Waiting to be claimed" />
        <StatCard label="Claimed" value={String(claimedCount)} note="Received" />
        <StatCard
          label="Water funded"
          value={`${waterFundedGallons} gal`}
          note="From your roundups"
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
                key={link.id}
                link={link}
                onClawbackClick={(target) => setClawbackLink(target)}
              />
            ))}
          </div>
        )}
      </div>

      <ClawbackModal
        link={clawbackLink}
        isOpen={!!clawbackLink}
        onClose={() => setClawbackLink(null)}
        onConfirmClawback={handleConfirmClawback}
      />
    </PageShell>
  );
}
