"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { ClaimProgress } from "@/components/claim/ClaimProgress";
import { PostClaimView } from "@/components/claim/PostClaimView";
import { getLinkById, updateLinkStatus } from "@/lib/storage";
import { PaymentLinkRecord, ClaimVerificationState } from "@/lib/types";
import { extractKeyFromFragment } from "@/lib/crypto";
import { entryAmount } from "@/lib/utils";
import { celebrate } from "@/lib/celebrate";
import { AppleIcon, GoogleIcon } from "@/components/ui/BrandIcons";
import { Wallet } from "lucide-react";

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

          celebrate();
        }, 600);
      }, 500);
    }, 500);
  };

  if (!linkRecord) {
    return <ClaimSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {claimState === "idle" && (
        <>
          <h1 className="sr-only">Claim your payment</h1>
          <EnvelopeCard
            amount={entryAmount(linkRecord)}
            currency={linkRecord.currency}
            recipientNote={linkRecord.recipientNote}
            themeId={linkRecord.themeId}
            hasWaterDonation={linkRecord.hasWaterDonation}
          />

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => handleStartClaim("google")}
              className="btn btn-primary w-full"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <GoogleIcon />
              </span>
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleStartClaim("apple")}
              className="btn btn-secondary w-full"
            >
              <AppleIcon />
              <span>Continue with Apple</span>
            </button>
            <button
              type="button"
              onClick={() => handleStartClaim("wallet")}
              className="btn btn-ghost w-full"
            >
              <Wallet aria-hidden="true" />
              <span>Connect Sui wallet</span>
            </button>
          </div>
          <p className="type-help text-center">You pay no gas and need no seed phrase.</p>
        </>
      )}

      {(claimState === "authenticating" ||
        claimState === "verifying" ||
        claimState === "claiming") && (
        <ClaimProgress state={claimState} />
      )}

      {claimState === "success" && (
        <PostClaimView
          amount={entryAmount(linkRecord)}
          currency={linkRecord.currency}
          recipientAddress={recipientAddress}
          txDigest={txDigest}
          hasWaterDonation={linkRecord.hasWaterDonation}
        />
      )}
    </div>
  );
}

function ClaimSkeleton() {
  return (
    <div role="status" className="mx-auto w-full max-w-md space-y-4">
      <span className="sr-only">Loading your payment…</span>
      <div className="h-64 animate-pulse rounded-3xl bg-mist-light" />
      <div className="h-12 animate-pulse rounded-full bg-mist-light" />
      <div className="h-12 animate-pulse rounded-full bg-mist-light" />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <PageShell>
      <Suspense fallback={<ClaimSkeleton />}>
        <ClaimContent />
      </Suspense>
    </PageShell>
  );
}
