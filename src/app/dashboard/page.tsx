"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { ClawbackModal } from "@/components/dashboard/ClawbackModal";
import { getStoredLinks, updateLinkStatus } from "@/lib/storage";
import { PaymentLinkRecord, EscrowStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Droplets, Clock, CheckCircle2, Layers, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const [links, setLinks] = useState<PaymentLinkRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | EscrowStatus>("all");
  const [clawbackLink, setClawbackLink] = useState<PaymentLinkRecord | null>(null);

  useEffect(() => {
    setLinks(getStoredLinks());
  }, []);

  const handleConfirmClawback = (id: string) => {
    updateLinkStatus(id, "reclaimed");
    setLinks(getStoredLinks());
  };

  const filteredLinks = links.filter((link) => {
    if (activeTab === "all") return true;
    return link.status === activeTab;
  });

  // Calculate summary metrics
  const totalVolumeUsd = links.reduce((sum, l) => sum + l.amountUsd, 0);
  const pendingCount = links.filter((l) => l.status === "pending").length;
  const claimedCount = links.filter((l) => l.status === "claimed").length;
  const waterFundedGallons =
    links.filter((l) => l.hasWaterDonation).length * 10;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mist-light text-ink text-xs font-mono uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5 text-frost-dark" aria-hidden="true" />
                <span>Sender Activity</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink tracking-[-0.03em]">
                Payment Links Dashboard
              </h1>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-normal mt-1">
                Track your active escrow links, monitor claim status, and reclaim funds.
              </p>
            </div>

            <Link
              href="/send"
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-medium text-xs sm:text-sm shadow-subtle shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create New Link</span>
            </Link>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-snow border border-mist/50">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                Total Volume
              </span>
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-ink mt-1 font-light tracking-[-0.03em]">
                {formatCurrency(totalVolumeUsd, "USD")}
              </p>
              <span className="text-xs font-mono text-ink-muted mt-1 block">
                {links.length} total transfers
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-snow border border-mist/50">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-700">
                Pending Escrows
              </span>
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-ink mt-1 font-light tracking-[-0.03em]">
                {pendingCount}
              </p>
              <span className="text-xs font-mono text-ink-muted mt-1 block">
                With 14-day safety lock
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-snow border border-mist/50">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-700">
                Claimed & Settled
              </span>
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-ink mt-1 font-light tracking-[-0.03em]">
                {claimedCount}
              </p>
              <span className="text-xs font-mono text-ink-muted mt-1 block">
                Instant receiver transfer
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/50 border border-sky-200">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-800 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
                Water Filtered
              </span>
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-sky-900 mt-1 font-light tracking-[-0.03em]">
                {waterFundedGallons} Gal
              </p>
              <span className="text-xs font-mono text-sky-700 mt-1 block">
                Lofi Mission roundups
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter payment links by status"
            className="flex items-center gap-2 border-b border-mist/30 pb-4 overflow-x-auto"
          >
            {[
              { id: "all", label: `All (${links.length})` },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "claimed", label: `Claimed (${claimedCount})` },
              {
                id: "expired",
                label: `Expired (${
                  links.filter((l) => l.status === "expired" || l.status === "reclaimed").length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="links-grid"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-all whitespace-nowrap min-h-[36px] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  activeTab === tab.id
                    ? "bg-ink text-white font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-snow"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Links Grid */}
          <div id="links-grid" role="tabpanel" aria-label="Payment links list">
            {filteredLinks.length === 0 ? (
              <div className="py-20 text-center space-y-4 border border-dashed border-mist rounded-3xl p-8">
                <p className="text-sm font-mono text-ink-muted">
                  No payment links found in this category.
                </p>
                <Link
                  href="/send"
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium min-h-[44px]"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Create your first link</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        </div>
      </main>

      {/* Clawback confirmation modal */}
      <ClawbackModal
        link={clawbackLink}
        isOpen={!!clawbackLink}
        onClose={() => setClawbackLink(null)}
        onConfirmClawback={handleConfirmClawback}
      />

      <Footer />
    </div>
  );
}
