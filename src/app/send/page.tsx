"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmountKeypad } from "@/components/send/AmountKeypad";
import { ThemeSelector } from "@/components/send/ThemeSelector";
import { WaterRoundupToggle } from "@/components/send/WaterRoundupToggle";
import { NoteInput } from "@/components/send/NoteInput";
import { ShareModal } from "@/components/send/ShareModal";
import { CardThemeId, PaymentLinkRecord } from "@/lib/types";
import { generateEphemeralKeypair, buildClaimUrl } from "@/lib/crypto";
import { saveCreatedLink } from "@/lib/storage";
import { usdToSui, formatCurrency } from "@/lib/utils";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function SendPage() {
  const [amountStr, setAmountStr] = useState<string>("10");
  const [currency, setCurrency] = useState<"USD" | "SUI" | "LOFI">("USD");
  const [selectedThemeId, setSelectedThemeId] = useState<CardThemeId>("glacial");
  const [hasWaterDonation, setHasWaterDonation] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedClaimUrl, setGeneratedClaimUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const numericAmount = parseFloat(amountStr) || 0;
  const waterDonationUsd = hasWaterDonation ? 0.10 : 0;
  const totalUsd = numericAmount + waterDonationUsd;
  const totalSui = usdToSui(totalUsd);

  const handleCreateLink = () => {
    if (numericAmount <= 0) return;
    setIsCreating(true);

    try {
      // 1. Generate client-side ephemeral keypair
      const keypair = generateEphemeralKeypair();

      // 2. Mock or on-chain escrow object creation ID
      const randomEscrowSuffix = Math.random().toString(36).substring(2, 10);
      const escrowId = `escrow_0x${randomEscrowSuffix}`;

      // 3. Build claim URL where secret key is ONLY in hash fragment (#)
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

      const claimUrl = buildClaimUrl(baseUrl, escrowId, keypair.privateKeyHex);

      // 4. Save record into local sender storage
      const record: PaymentLinkRecord = {
        id: escrowId,
        ephemeralPrivateKey: keypair.privateKeyHex,
        ephemeralPublicKey: keypair.publicKeyHex,
        amountUsd: numericAmount,
        amountSui: usdToSui(numericAmount),
        amountLofi: numericAmount * 20,
        currency,
        recipientNote: note.trim() || "A gift for you",
        themeId: selectedThemeId,
        waterDonationUsd,
        waterDonationSui: usdToSui(waterDonationUsd),
        hasWaterDonation,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 days default
        status: "pending",
        viewsCount: 0,
      };

      saveCreatedLink(record);

      setGeneratedClaimUrl(claimUrl);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error("Failed to create link", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mist-light text-ink text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-frost-dark" aria-hidden="true" />
              <span>Step 1 of 2 · Transfer Creator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink tracking-[-0.03em]">
              Create Payment Link
            </h1>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-normal max-w-md mx-auto">
              Choose an amount, customize a greeting card, and send it instantly with zero custody.
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-3xl border border-mist/60 shadow-card p-6 sm:p-8 space-y-8">
            {/* 1. Keypad Amount */}
            <AmountKeypad
              amountStr={amountStr}
              currency={currency}
              onChangeAmount={setAmountStr}
              onToggleCurrency={setCurrency}
            />

            {/* Divider */}
            <div className="border-t border-mist/20" />

            {/* 2. Theme Selector */}
            <ThemeSelector
              selectedThemeId={selectedThemeId}
              onSelectTheme={setSelectedThemeId}
            />

            {/* 3. Note Input */}
            <NoteInput note={note} onChangeNote={setNote} />

            {/* 4. Water Roundup Toggle */}
            <WaterRoundupToggle
              enabled={hasWaterDonation}
              onToggle={setHasWaterDonation}
              donationAmountUsd={0.10}
            />

            {/* 5. Summary & Action */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted pb-3">
                <span>Total to lock in Escrow:</span>
                <span className="font-semibold text-ink">
                  {formatCurrency(totalUsd, "USD")} ({totalSui} SUI)
                </span>
              </div>

              <button
                type="button"
                disabled={numericAmount <= 0 || isCreating}
                onClick={handleCreateLink}
                aria-busy={isCreating}
                className="w-full btn-primary py-4 rounded-full min-h-[50px] text-sm sm:text-base font-medium shadow-subtle hover:scale-[1.01] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{isCreating ? "Generating Escrow..." : "Create Encrypted Payment Link"}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-ink-muted mt-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Non-custodial escrow with 14-day sender clawback</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal Dialog */}
      <ShareModal
        claimUrl={generatedClaimUrl}
        amountDisplay={formatCurrency(numericAmount, currency)}
        recipientNote={note}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
