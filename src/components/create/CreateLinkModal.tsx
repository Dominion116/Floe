"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { TransactionDataBuilder } from "@mysten/sui/transactions";
import { fromBase64 } from "@mysten/sui/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { Modal, ModalClose } from "@/components/ui/Dialog";
import { DetailList } from "@/components/ui/DetailList";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { AmountKeypad } from "@/components/send/AmountKeypad";
import { ThemeSelector } from "@/components/send/ThemeSelector";
import { NoteInput } from "@/components/send/NoteInput";
import { WaterRoundupToggle } from "@/components/send/WaterRoundupToggle";
import { SharePanel } from "@/components/send/SharePanel";
import { WalletPicker } from "@/components/wallet/WalletPicker";
import {
  LINK_DURATION_MS,
  PACKAGE_ID,
  fundingToken,
  type Currency,
} from "@/lib/chain/config";
import { dAppKit } from "@/lib/chain/dappKit";
import {
  buildCreate,
  chainErrorMessage,
  createdEscrowId,
  readCreated,
  suiClient,
  toUnits,
} from "@/lib/chain/escrow";
import type { CardThemeId, PaymentLinkRecord } from "@/lib/types";
import { generateEphemeralKeypair, buildClaimUrl } from "@/lib/crypto";
import { removeLink, saveLink, updateLink } from "@/lib/storage";
import { refreshPrices, usePrices } from "@/lib/usePrices";
import { cn, formatCurrency, formatRate, toUsd, usdToToken } from "@/lib/utils";

const STEPS = [
  {
    id: "amount",
    title: "How much are you sending?",
    description: "Type an amount or pick one to start.",
  },
  {
    id: "personalize",
    title: "Make it personal",
    description: "Choose an envelope and add a note they’ll see first.",
  },
  {
    id: "review",
    title: "Check the details",
    description: "This is the envelope they’ll open.",
  },
  {
    id: "share",
    title: "Your link is ready",
    description: "Anyone with this link can claim the money, so send it privately.",
  },
] as const;

const SHARE = STEPS.length - 1;

/** A payment that has been signed. Resending it is safe: Sui runs the same bytes only once. */
interface SignedPayment {
  bytes: Uint8Array;
  signature: string;
  digest: string;
  privateKey: string;
  note: string;
}

interface CreateLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLinkModal({ open, onClose, onCreated }: CreateLinkModalProps) {
  const [step, setStep] = useState(0);
  const [amountStr, setAmountStr] = useState<string>("10");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedThemeId, setSelectedThemeId] = useState<CardThemeId>("glacial");
  const [hasWaterDonation, setHasWaterDonation] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");
  const [generatedClaimUrl, setGeneratedClaimUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The link exists only in this modal, so closing it unsaved asks first.
  const [linkSaved, setLinkSaved] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  // Signed, but not known to have reached the chain.
  const [unconfirmed, setUnconfirmed] = useState<SignedPayment | null>(null);
  const account = useCurrentAccount({ dAppKit });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const numericAmount = parseFloat(amountStr) || 0;
  const waterDonationUsd = hasWaterDonation ? 0.10 : 0;
  const { rates, status: ratesStatus } = usePrices(open);
  const amountInUsd = toUsd(numericAmount, currency, rates);
  // Paid in the chosen token. Dollar links are paid in SUI.
  const payToken = fundingToken(currency);
  const totalUsd = amountInUsd === null ? null : amountInUsd + waterDonationUsd;
  const totalDisplay =
    rates && totalUsd !== null
      ? `${formatCurrency(totalUsd)} (${formatCurrency(usdToToken(totalUsd, rates[payToken]), payToken)})`
      : ratesStatus === "loading"
        ? "Checking live price…"
        : "Live price unavailable";
  const current = STEPS[step];

  // Each step starts at the top with its title announced.
  useEffect(() => {
    if (!open) return;
    bodyRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step, open]);

  const hasUnsavedLink = (step === SHARE && !linkSaved) || unconfirmed !== null;

  useEffect(() => {
    if (!hasUnsavedLink) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedLink]);

  const handleClose = () => {
    if (isCreating) return;
    if (hasUnsavedLink) {
      setConfirmClose(true);
      return;
    }
    closeAndReset();
  };

  const closeAndReset = () => {
    onClose();
    // An unfinished draft is kept. A finished one starts over next time.
    if (step === SHARE || unconfirmed) {
      setUnconfirmed(null);
      setStep(0);
      setAmountStr("10");
      setCurrency("USD");
      setSelectedThemeId("glacial");
      setHasWaterDonation(true);
      setNote("");
      setGeneratedClaimUrl("");
      setLinkSaved(false);
      setConfirmClose(false);
    }
    setError(null);
  };

  const showLink = (payment: SignedPayment, escrowId: string) => {
    updateLink(payment.digest, { escrowId, status: "pending" });
    setUnconfirmed(null);
    setGeneratedClaimUrl(
      buildClaimUrl(window.location.origin, escrowId, payment.privateKey, payment.note)
    );
    setLinkSaved(false);
    setConfirmClose(false);
    setStep(SHARE);
    onCreated();
  };

  /** Sends a signed payment, then works out what really happened before saying anything. */
  const send = async (payment: SignedPayment) => {
    let outcome = await readCreated(payment.digest);
    if (outcome.status !== "created" && outcome.status !== "failed") {
      try {
        const result = await suiClient.executeTransaction({
          transaction: payment.bytes,
          signatures: [payment.signature],
          include: { effects: true, objectTypes: true },
        });
        const escrowId = result.Transaction && createdEscrowId(result.Transaction);
        outcome = escrowId ? { status: "created", escrowId } : { status: "failed" };
      } catch {
        outcome = await readCreated(payment.digest);
      }
    }

    if (outcome.status === "created") {
      showLink(payment, outcome.escrowId);
    } else if (outcome.status === "failed") {
      removeLink(payment.digest);
      setUnconfirmed(null);
      setError("The payment failed, so no money was locked. Check your balance, then try again.");
    } else {
      setUnconfirmed(payment);
      setError(
        "We couldn’t confirm the payment. Check again to resend the same one. You won’t be charged twice."
      );
    }
  };

  const handleCreateLink = async () => {
    if (numericAmount <= 0) return;
    if (!PACKAGE_ID) {
      setError("Sending isn’t set up on this site yet. The Floe contract hasn’t been connected.");
      return;
    }
    setError(null);

    if (unconfirmed) {
      setIsCreating(true);
      await send(unconfirmed);
      setIsCreating(false);
      return;
    }

    if (!account) {
      setError("Choose the wallet to pay from.");
      return;
    }
    if (!rates) {
      setError("Live prices are unavailable, so the total can’t be worked out. Try again in a moment.");
      void refreshPrices();
      return;
    }

    const rate = rates[payToken];
    const amountUnits = toUnits(
      currency === "USD" ? usdToToken(numericAmount, rate) : numericAmount
    );
    const waterUnits = hasWaterDonation ? toUnits(usdToToken(waterDonationUsd, rate)) : BigInt(0);
    if (amountUnits <= BigInt(0)) {
      setError("That amount is too small to send. Go back and enter a larger one.");
      return;
    }

    setIsCreating(true);
    try {
      // The private key stays in memory until it becomes part of the link.
      const keypair = generateEphemeralKeypair();
      const signed = await dAppKit.signTransaction({
        transaction: buildCreate({
          token: payToken,
          amountUnits,
          waterUnits,
          publicKeyHex: keypair.publicKeyHex,
          durationMs: LINK_DURATION_MS,
          themeId: selectedThemeId,
        }),
      });

      const bytes = fromBase64(signed.bytes);
      const digest = TransactionDataBuilder.getDigestFromBytes(bytes);
      const trimmedNote = note.trim() || "A gift for you";
      const record: PaymentLinkRecord = {
        digest,
        escrowId: null,
        sender: account.address,
        currency,
        enteredAmount: numericAmount,
        token: payToken,
        amountUnits: amountUnits.toString(),
        recipientNote: trimmedNote,
        themeId: selectedThemeId,
        hasWaterDonation,
        createdAt: Date.now(),
        expiresAt: Date.now() + LINK_DURATION_MS,
        status: "creating",
      };

      // Saved before sending, so the money can always be found and refunded.
      saveLink(record);
      await send({
        bytes,
        signature: signed.signature,
        digest,
        privateKey: keypair.privateKey,
        note: trimmedNote,
      });
    } catch (err) {
      setError(
        chainErrorMessage(err, "Unable to create your link. Nothing was sent. Try again in a moment.")
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0 && numericAmount <= 0) {
      setError("Enter an amount above 0 to continue.");
      return;
    }
    if (current.id === "review") {
      void handleCreateLink();
      return;
    }
    if (step === SHARE) {
      handleClose();
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleAmountChange = (value: string) => {
    setError(null);
    setAmountStr(value);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy="create-link-title"
      describedBy="create-link-description"
      className="h-[94dvh] sm:h-fit"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
        <header className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-5">
          <div className="flex items-center justify-between gap-4">
            <p className="type-help tabular-nums">
              Step {step + 1} of {STEPS.length}
            </p>
            <div className="-mr-2">
              <ModalClose onClose={handleClose} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2" aria-hidden="true">
            {STEPS.map((s, idx) => (
              <span
                key={s.id}
                className={cn("h-1 rounded-full", idx <= step ? "bg-ink" : "bg-mist-light")}
              />
            ))}
          </div>
          <h2
            ref={headingRef}
            id="create-link-title"
            tabIndex={-1}
            className="type-title mt-5"
          >
            {current.title}
          </h2>
          <p id="create-link-description" className="text-sm text-ink-muted mt-1">
            {current.description}
          </p>
        </header>

        <div ref={bodyRef} className="modal-body sm:flex-[0_1_28rem]">
          <div key={current.id} className="step-enter pb-2">
            {current.id === "amount" && (
              <AmountKeypad
                amountStr={amountStr}
                currency={currency}
                rates={rates}
                ratesStatus={ratesStatus}
                error={error}
                onChangeAmount={handleAmountChange}
                onToggleCurrency={setCurrency}
              />
            )}

            {current.id === "personalize" && (
              <div className="space-y-6">
                <ThemeSelector
                  selectedThemeId={selectedThemeId}
                  onSelectTheme={setSelectedThemeId}
                />
                <NoteInput note={note} onChangeNote={setNote} />
                <WaterRoundupToggle
                  enabled={hasWaterDonation}
                  onToggle={setHasWaterDonation}
                  donationAmountUsd={0.10}
                />
              </div>
            )}

            {current.id === "review" && (
              <div className="space-y-4">
                <EnvelopeCard
                  amount={numericAmount}
                  currency={currency}
                  recipientNote={note.trim() || "A gift for you"}
                  themeId={selectedThemeId}
                  hasWaterDonation={hasWaterDonation}
                  compact
                />
                <DetailList
                  items={[
                    {
                      label: "They receive",
                      value:
                        currency === "USD"
                          ? rates
                            ? `About ${formatCurrency(usdToToken(numericAmount, rates.SUI), "SUI")}`
                            : "Checking live price…"
                          : formatCurrency(numericAmount, currency),
                    },
                    {
                      label: "Clean water roundup",
                      value: hasWaterDonation ? formatCurrency(waterDonationUsd) : "None",
                    },
                    { label: "Gas for them", value: "$0.00" },
                    { label: "Link expires", value: "In 14 days" },
                    {
                      label: "Live price",
                      value: rates ? formatRate(payToken, rates[payToken]) : "Unavailable",
                    },
                    { label: "Total from you", value: totalDisplay },
                  ]}
                />
                <WalletPicker label="Pay from" disabled={isCreating || unconfirmed !== null} />
                <p className="type-help">
                  {currency === "USD" && "They receive SUI, so the dollar value can move. "}
                  Floe never holds the money. You can cancel and refund from your dashboard while
                  the link is unclaimed.
                </p>
                {error && (
                  <p role="alert" className="text-sm text-danger">
                    {error}
                  </p>
                )}
              </div>
            )}

            {current.id === "share" && (
              <SharePanel
                claimUrl={generatedClaimUrl}
                amountDisplay={formatCurrency(numericAmount, currency)}
                onSaved={() => {
                  setLinkSaved(true);
                  setConfirmClose(false);
                }}
              />
            )}
          </div>
        </div>

        {confirmClose && (
          <div role="alert" className="shrink-0 px-4 pt-4 sm:px-6">
            <p className="text-base font-medium text-ink">Close without saving the link?</p>
            <p className="mt-1 text-sm text-ink-muted">
              You won’t be able to see it again. If the money was locked, you can refund it from your
              dashboard.
            </p>
          </div>
        )}

        {confirmClose ? (
          <footer className="modal-footer flex-col sm:flex-row-reverse">
            <button
              type="button"
              autoFocus
              onClick={() => setConfirmClose(false)}
              className="btn btn-secondary sm:flex-1"
            >
              Keep it open
            </button>
            <button
              type="button"
              onClick={closeAndReset}
              className="btn btn-danger-ghost sm:flex-1"
            >
              Close without saving
            </button>
          </footer>
        ) : (
        <footer className="modal-footer">
          {step > 0 && step < SHARE && !unconfirmed && (
            <button
              type="button"
              disabled={isCreating}
              onClick={handleBack}
              className="btn btn-secondary"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isCreating}
            aria-busy={isCreating}
            className={cn("btn flex-1", step === SHARE ? "btn-secondary" : "btn-primary")}
          >
            {current.id === "review" ? (
              <>
                {isCreating && <Loader2 className="animate-spin" aria-hidden="true" />}
                <span>{unconfirmed ? "Check again" : "Create payment link"}</span>
              </>
            ) : step === SHARE ? (
              <span>Done</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </footer>
        )}
      </form>
    </Modal>
  );
}
