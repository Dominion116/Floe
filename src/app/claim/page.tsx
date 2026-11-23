"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { ClaimProgress } from "@/components/claim/ClaimProgress";
import { PostClaimView } from "@/components/claim/PostClaimView";
import { getLinkById, updateLinkStatus } from "@/lib/storage";
import { PaymentLinkRecord, ClaimVerificationState } from "@/lib/types";
import { extractKeyFromFragment } from "@/lib/crypto";
import confetti from "canvas-confetti";
import { ShieldAlert, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

function ClaimContent() {
  const searchParams = useSearchParams();
  const escrowId = searchParams.get("id") || "escrow_demo";

  const [linkRecord, setLinkRecord] = useState<PaymentLinkRecord | null>(null);
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<ClaimVerificationState["step"]>("idle");
  const [txDigest, setTxDigest] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");

  useEffect(() => {
    // 1. Extract ephemeral secret key from URL hash fragment (#)
    if (typeof window !== "undefined") {
      const key = extractKeyFromFragment(window.location.hash);
      setEphemeralKey(key);
    }

    // 2. Fetch or mock record
    const existing = getLinkById(escrowId);
    if (existing) {
      setLinkRecord(existing);
      if (existing.status === "claimed") {
        setClaimState("success");
        setRecipientAddress(existing.claimedByMasked || "0x7a81...3f1c");
        setTxDigest("9zKx12...mockDigest");
      }
    } else {
      // Default fallback envelope for demo links
      setLinkRecord({
        id: escrowId,
        ephemeralPrivateKey: "mock_sk",
        ephemeralPublicKey: "mock_pk",
        amountUsd: 10.0,
        amountSui: 4.0,
        amountLofi: 200,
        currency: "USD",
        recipientNote: "Here is your payment on Floe!",
        themeId: "glacial",
        waterDonationUsd: 0.1,
        waterDonationSui: 0.04,
        hasWaterDonation: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14,
        status: "pending",
      });
    }
  }, [escrowId]);

  const handleStartClaim = (provider: "google" | "apple" | "wallet") => {
    setClaimState("authenticating");

    // Realistic zkLogin authentication flow timing (< 2 seconds total)
    setTimeout(() => {
      setClaimState("verifying");
      setTimeout(() => {
        setClaimState("claiming");
        setTimeout(() => {
          // Derive realistic recipient Sui address
          const randomHex = Math.random().toString(16).substring(2, 10);
          const newAddress = `0x${randomHex}91823ab4c7d01827c19a84b0294e1982`;
          const generatedTx = `5K${Math.random().toString(36).substring(2, 14)}sui`;

          setRecipientAddress(newAddress);
          setTxDigest(generatedTx);
          setClaimState("success");

          // Update storage status
          updateLinkStatus(escrowId, "claimed");

          // Confetti celebration
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ["#C3CEEF", "#CCD3CD", "#121111", "#98A9E6"],
            });
          } catch {
            // fallback
          }
        }, 600);
      }, 500);
    }, 500);
  };

  if (!linkRecord) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-mono text-ink-muted">Loading claim details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {claimState === "idle" && (
        <>
          <EnvelopeCard
            amountUsd={linkRecord.amountUsd}
            currency={linkRecord.currency}
            recipientNote={linkRecord.recipientNote}
            themeId={linkRecord.themeId}
            hasWaterDonation={linkRecord.hasWaterDonation}
          />

          {/* Authentication Actions */}
          <div className="bg-white rounded-3xl border border-mist/50 p-6 shadow-subtle space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-ink-muted text-center mb-1">
              Claim into your account
            </p>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleStartClaim("google")}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-full bg-white border border-mist hover:border-ink text-ink font-medium text-sm transition-all shadow-subtle hover:scale-[1.01] active:scale-[0.97] min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Apple OAuth Button */}
            <button
              type="button"
              onClick={() => handleStartClaim("apple")}
              className="w-full btn-primary py-3.5 px-5 rounded-full min-h-[48px] text-sm font-medium shadow-subtle hover:scale-[1.01] active:scale-[0.97]"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170" aria-hidden="true">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.5-7.71-11.45-14.01-6.19-9.87-11.05-20.9-14.59-33.09-3.53-12.19-5.3-23.75-5.3-34.68 0-14.33 3.48-26.4 10.45-36.21 6.97-9.81 15.73-14.82 26.29-15.04 4.89 0 10.22 1.3 15.99 3.92 5.76 2.62 9.54 3.98 11.34 4.09 1.41 0 5.44-1.52 12.09-4.57 6.64-3.04 12.56-4.34 17.75-3.9 13.06 1.09 23.39 6.2 31 15.34-11.53 6.96-17.18 16.64-16.97 29.04.22 9.79 3.91 18.06 11.09 24.8 7.18 6.74 15.66 10.55 25.45 11.42-2.5 7.62-5.44 15.11-8.83 22.47zM119.22 31.84c0-7.72 2.76-14.95 8.28-21.69 5.52-6.74 12.39-10.76 20.61-12.06.22 1.09.33 2.18.33 3.26 0 7.61-2.82 14.89-8.48 21.84-5.65 6.96-12.55 10.88-20.74 11.75z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Fallback Web3 Wallet */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => handleStartClaim("wallet")}
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-mono transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Web3 Native? Connect Sui Wallet</span>
              </button>
            </div>
          </div>
        </>
      )}

      {(claimState === "authenticating" ||
        claimState === "verifying" ||
        claimState === "claiming") && (
        <ClaimProgress state={claimState} />
      )}

      {claimState === "success" && (
        <PostClaimView
          amountUsd={linkRecord.amountUsd}
          recipientAddress={recipientAddress}
          txDigest={txDigest}
          hasWaterDonation={linkRecord.hasWaterDonation}
        />
      )}
    </div>
  );
}

export default function ClaimPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-24 text-center font-mono text-xs text-ink-muted" aria-live="polite">
              Loading claim...
            </div>
          }
        >
          <ClaimContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
