"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Modal, ModalClose } from "@/components/ui/Dialog";
import { DetailList } from "@/components/ui/DetailList";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { AmountKeypad } from "@/components/send/AmountKeypad";
import { ThemeSelector } from "@/components/send/ThemeSelector";
import { NoteInput } from "@/components/send/NoteInput";
import { WaterRoundupToggle } from "@/components/send/WaterRoundupToggle";
import { SharePanel } from "@/components/send/SharePanel";
import { CardThemeId, PaymentLinkRecord } from "@/lib/types";
import { generateEphemeralKeypair, buildClaimUrl } from "@/lib/crypto";
import { saveCreatedLink } from "@/lib/storage";
import { refreshPrices, usePrices } from "@/lib/usePrices";
import { cn, convertAmount, formatCurrency, formatRate, toUsd, usdToToken } from "@/lib/utils";

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

interface CreateLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLinkModal({ open, onClose, onCreated }: CreateLinkModalProps) {
  const [step, setStep] = useState(0);
  const [amountStr, setAmountStr] = useState<string>("10");
  const [currency, setCurrency] = useState<"USD" | "SUI" | "LOFI">("USD");
  const [selectedThemeId, setSelectedThemeId] = useState<CardThemeId>("glacial");
  const [hasWaterDonation, setHasWaterDonation] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");
  const [generatedClaimUrl, setGeneratedClaimUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The link exists only in this modal, so closing it unsaved asks first.
  const [linkSaved, setLinkSaved] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const numericAmount = parseFloat(amountStr) || 0;
  const waterDonationUsd = hasWaterDonation ? 0.10 : 0;
  const { rates, status: ratesStatus } = usePrices(open);
  const amountInUsd = toUsd(numericAmount, currency, rates);
  // Paid in the chosen token. Dollar links are paid in SUI.
  const payToken = currency === "LOFI" ? "LOFI" : "SUI";
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

  const hasUnsavedLink = step === SHARE && !linkSaved;

  useEffect(() => {
    if (!hasUnsavedLink) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedLink]);

  const handleClose = () => {
    if (hasUnsavedLink) {
      setConfirmClose(true);
      return;
    }
    closeAndReset();
  };

  const closeAndReset = () => {
    onClose();
    // An unfinished draft is kept. A finished one starts over next time.
    if (step === SHARE) {
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

  const handleCreateLink = () => {
    if (numericAmount <= 0) return;
    if (!rates) {
      setError("Live prices are unavailable, so the total can’t be worked out. Try again in a moment.");
      void refreshPrices();
      return;
    }
    setIsCreating(true);
    setError(null);

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
        ephemeralPublicKey: keypair.publicKeyHex,
        ...convertAmount(numericAmount, currency, rates),
        currency,
        recipientNote: note.trim() || "A gift for you",
        themeId: selectedThemeId,
        waterDonationUsd,
        waterDonationSui: usdToToken(waterDonationUsd, rates.SUI),
        hasWaterDonation,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 days default
        status: "pending",
        viewsCount: 0,
      };

      saveCreatedLink(record);

      setGeneratedClaimUrl(claimUrl);
      setLinkSaved(false);
      setStep(SHARE);
      onCreated();
    } catch (err) {
      console.error("Failed to create link", err);
      setError("Unable to create your link. Check your connection, then try again.");
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
      handleCreateLink();
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
                    { label: "They receive", value: formatCurrency(numericAmount, currency) },
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
                <p className="type-help">
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
              You won’t be able to see it again. You can still refund the money from your dashboard.
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
          {step > 0 && step < SHARE && (
            <button type="button" onClick={handleBack} className="btn btn-secondary">
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
                <span>Create payment link</span>
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
