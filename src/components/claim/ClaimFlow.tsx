"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWallets, type UiWallet } from "@mysten/dapp-kit-react";
import { isEnokiWallet, isGoogleWallet } from "@mysten/enoki";
import { EnokiClient } from "@mysten/enoki/client";
import { isValidSuiObjectId, toBase64 } from "@mysten/sui/utils";
import { Wallet } from "lucide-react";
import { ClaimProgress } from "@/components/claim/ClaimProgress";
import { ClaimSkeleton } from "@/components/claim/ClaimSkeleton";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { PostClaimView } from "@/components/claim/PostClaimView";
import { GoogleIcon } from "@/components/ui/BrandIcons";
import { celebrate } from "@/lib/celebrate";
import { ENOKI, NETWORK, PACKAGE_ID } from "@/lib/chain/config";
import { dAppKit } from "@/lib/chain/dappKit";
import {
  buildClaim,
  chainErrorMessage,
  fromUnits,
  readClosed,
  readEscrows,
  suiClient,
  type Escrow,
} from "@/lib/chain/escrow";
import { parseClaimFragment } from "@/lib/crypto";
import type { ClaimVerificationState } from "@/lib/types";

type View =
  | { kind: "loading" }
  | { kind: "problem"; title: string; body: string; retry?: boolean }
  | { kind: "ready"; escrow: Escrow; privateKey: string; note: string };

/** Thrown with copy that is safe to show. */
class ClaimError extends Error {
  constructor(
    message: string,
    readonly stale = false
  ) {
    super(message);
  }
}

async function submitClaim(bytes: string, signature: string): Promise<string> {
  const res = await fetch("/api/claim", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bytes, signature }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    digest?: string;
    error?: string;
    code?: string;
  };
  if (res.ok && data.digest) return data.digest;
  throw new ClaimError(
    data.error ?? "The claim couldn’t be completed. Try again in a moment.",
    data.code === "stale"
  );
}

export default function ClaimFlow() {
  const escrowId = useSearchParams().get("id") ?? "";
  const wallets = useWallets({ dAppKit });
  const googleWallet = wallets.find((w) => isGoogleWallet(w));
  const otherWallets = wallets.filter((w) => !isEnokiWallet(w));

  const [view, setView] = useState<View>({ kind: "loading" });
  const [step, setStep] = useState<ClaimVerificationState["step"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showWallets, setShowWallets] = useState(false);
  const [receipt, setReceipt] = useState<{ digest: string; recipient: string } | null>(null);

  const load = useCallback(async () => {
    setView({ kind: "loading" });

    if (!PACKAGE_ID) {
      setView({
        kind: "problem",
        title: "Claiming isn’t set up yet",
        body: "This site isn’t connected to the Floe contract. Your money hasn’t moved.",
      });
      return;
    }

    const { privateKey, note } = parseClaimFragment(window.location.hash);
    if (!isValidSuiObjectId(escrowId) || !privateKey) {
      setView({
        kind: "problem",
        title: "This link is incomplete",
        body: "Part of it is missing. Ask the sender to copy the whole link and send it again.",
      });
      return;
    }

    try {
      const escrow = (await readEscrows([escrowId])).get(escrowId);
      if (escrow === undefined) throw new Error("Unreadable escrow");
      if (escrow === null) {
        const closed = await readClosed(escrowId);
        setView({
          kind: "problem",
          title:
            closed?.kind === "claimed"
              ? "This money was already claimed"
              : closed?.kind === "reclaimed"
                ? "The sender took this money back"
                : "This link has melted away",
          body:
            closed?.kind === "claimed"
              ? "If that wasn’t you, ask the sender who else has the link."
              : "Ask the sender for a new link.",
        });
        return;
      }
      if (Date.now() > escrow.expiresAt) {
        setView({
          kind: "problem",
          title: "This link has expired",
          body: "Ask the sender for a new one. The money is still theirs to refund.",
        });
        return;
      }
      setView({ kind: "ready", escrow, privateKey, note });
    } catch {
      setView({
        kind: "problem",
        title: "Unable to load this link",
        body: "Check your connection, then try again.",
        retry: true,
      });
    }
  }, [escrowId]);

  useEffect(() => {
    void load();
  }, [load]);

  const claimWith = async (wallet: UiWallet, escrow: Escrow, privateKey: string) => {
    if (!ENOKI) return;
    setError(null);
    setStep("authenticating");
    try {
      const { accounts } = await dAppKit.connectWallet({ wallet });
      const recipient = accounts[0]?.address;
      if (!recipient) throw new ClaimError("No account was shared. Try again.");

      const attempt = async () => {
        setStep("verifying");
        const transaction = await buildClaim(escrow, privateKey, recipient);
        await new EnokiClient({ apiKey: ENOKI!.publicKey }).prepareSponsoredTransaction({
          transaction,
          network: NETWORK,
        });
        const built = await transaction.build({ client: suiClient });
        const signed = await dAppKit.signTransaction({ transaction: toBase64(built) });
        setStep("claiming");
        return submitClaim(signed.bytes, signed.signature);
      };

      let digest: string;
      try {
        digest = await attempt();
      } catch (err) {
        // The sponsor's gas details moved on between building and sending. Build it again once.
        if (!(err instanceof ClaimError && err.stale)) throw err;
        digest = await attempt();
      }

      setReceipt({ digest, recipient });
      setStep("success");
      navigator.vibrate?.(60);
      celebrate();
    } catch (err) {
      setStep("idle");
      setError(
        err instanceof ClaimError
          ? err.message
          : chainErrorMessage(err, "The claim didn’t go through. Try again in a moment.")
      );
    }
  };

  if (view.kind === "loading") return <ClaimSkeleton />;

  if (view.kind === "problem") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center lg:py-20">
        <h1 className="type-headline">{view.title}</h1>
        <p className="type-lede mt-4">{view.body}</p>
        {view.retry ? (
          <button type="button" onClick={() => void load()} className="btn btn-primary mt-8">
            Try again
          </button>
        ) : (
          <Link href="/" className="btn btn-secondary mt-8">
            Return home
          </Link>
        )}
      </div>
    );
  }

  const { escrow, privateKey, note } = view;
  const amount = fromUnits(escrow.amountUnits);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {step === "idle" && (
        <>
          <h1 className="sr-only">Claim your payment</h1>
          <EnvelopeCard
            amount={amount}
            currency={escrow.token}
            recipientNote={note}
            themeId={escrow.themeId}
            hasWaterDonation={escrow.waterUnits > BigInt(0)}
          />

          {error && (
            <p role="alert" className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={!googleWallet}
              aria-describedby="claim-help"
              onClick={() => googleWallet && void claimWith(googleWallet, escrow, privateKey)}
              className="btn btn-primary w-full"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <GoogleIcon />
              </span>
              <span>Continue with Google</span>
            </button>

            {ENOKI && (
              <button
                type="button"
                aria-expanded={showWallets}
                onClick={() => setShowWallets((shown) => !shown)}
                className="btn btn-ghost w-full"
              >
                <Wallet aria-hidden="true" />
                <span>Connect Sui wallet</span>
              </button>
            )}

            {showWallets && (
              <ul className="grid gap-2">
                {otherWallets.map((wallet) => (
                  <li key={wallet.name}>
                    <button
                      type="button"
                      onClick={() => void claimWith(wallet, escrow, privateKey)}
                      className="btn btn-secondary w-full justify-start px-4"
                    >
                      <img src={wallet.icon} alt="" className="h-6 w-6 shrink-0 rounded-md" />
                      <span className="flex-1 truncate text-left">{wallet.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p id="claim-help" className="type-help text-center">
            {ENOKI
              ? "You pay no gas and need no seed phrase."
              : "Login isn’t set up on this site yet, so this link can’t be claimed here."}
          </p>
        </>
      )}

      {(step === "authenticating" || step === "verifying" || step === "claiming") && (
        <ClaimProgress state={step} />
      )}

      {step === "success" && receipt && (
        <PostClaimView
          amount={amount}
          token={escrow.token}
          recipientAddress={receipt.recipient}
          txDigest={receipt.digest}
          hasWaterDonation={escrow.waterUnits > BigInt(0)}
        />
      )}
    </div>
  );
}
