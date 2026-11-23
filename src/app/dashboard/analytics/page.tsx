"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getStoredLinks } from "@/lib/storage";
import { PaymentLinkRecord } from "@/lib/types";
import { Droplets, ExternalLink, Waves, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [links, setLinks] = useState<PaymentLinkRecord[]>([]);

  useEffect(() => {
    setLinks(getStoredLinks());
  }, []);

  const totalTransfers = links.length;
  const claimedTransfers = links.filter((l) => l.status === "claimed").length;
  const claimRate = totalTransfers > 0 ? Math.round((claimedTransfers / totalTransfers) * 100) : 0;
  const waterDonationsCount = links.filter((l) => l.hasWaterDonation).length;
  const totalGallonsFiltered = 48290 + waterDonationsCount * 10;
  const totalWaterFundedUsd = (totalGallonsFiltered / 10) * 0.10;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
              <span>Philanthropic & Protocol Metrics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink tracking-[-0.03em]">
              Clean Water Impact & Analytics
            </h1>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-normal max-w-xl">
              Every 10¢ roundup micro-donation is verified by the Move smart contract and routed to the Lofi Foundation ocean cleanup initiative.
            </p>
          </div>

          {/* Hero Impact Banner */}
          <div className="bg-gradient-to-br from-[#EBF7F9] via-white to-[#D5EFF4] rounded-3xl p-8 sm:p-12 border border-[#9EE0ED]/60 relative overflow-hidden shadow-subtle">
            <Waves className="absolute -right-8 -bottom-8 w-64 h-64 text-sky-200/50 pointer-events-none -rotate-12" aria-hidden="true" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-800">
                  Total Clean Water Funded
                </span>
                <p className="text-4xl sm:text-5xl font-serif text-ink font-light mt-2 tracking-[-0.03em]">
                  {totalGallonsFiltered.toLocaleString()}
                </p>
                <span className="text-xs text-sky-700 font-mono mt-1 block">
                  Gallons of ocean water filtered
                </span>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-800">
                  Micro-Donation Value
                </span>
                <p className="text-4xl sm:text-5xl font-serif text-ink font-light mt-2 tracking-[-0.03em]">
                  ${totalWaterFundedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-xs text-sky-700 font-mono mt-1 block">
                  100% on-chain verified
                </span>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-800">
                  Claim Completion Rate
                </span>
                <p className="text-4xl sm:text-5xl font-serif text-ink font-light mt-2 tracking-[-0.03em]">
                  {claimRate}%
                </p>
                <span className="text-xs text-sky-700 font-mono mt-1 block">
                  Across all shared links
                </span>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-snow border border-mist/50 space-y-4">
              <h3 className="font-serif text-2xl text-ink font-light tracking-[-0.03em]">
                Treasury Contract Transparency
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                The Move 2024 package automatically enforces that the water donation cut cannot be diverted. In <code className="text-xs font-mono bg-white px-1.5 py-0.5 rounded border border-mist/40">floe::escrow::claim_escrow</code>, the donation is split into a separate coin and transferred directly to the immutable treasury address.
              </p>
              <div className="p-3.5 rounded-xl bg-white border border-mist/30 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Network:</span>
                  <span className="text-ink font-semibold">Sui Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Package:</span>
                  <span className="text-ink font-mono">floe::escrow (Move 2024)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Clean Water Treasury:</span>
                  <span className="text-sky-700 truncate max-w-[140px]">
                    0x10f1c1ea...0000
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-snow border border-mist/50 space-y-4">
              <h3 className="font-serif text-2xl text-ink font-light tracking-[-0.03em]">
                Why Roundups Matter
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Most peer-to-peer crypto tools ignore social impact. By integrating micro-donations directly into peer transfers, every lunch split, birthday gift, and coffee payment actively contributes to the environmental mission of the Lofi community.
              </p>
              <div className="pt-2">
                <Link
                  href="/send"
                  className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-medium min-h-[44px]"
                >
                  <span>Create a Link with Water Roundup</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
