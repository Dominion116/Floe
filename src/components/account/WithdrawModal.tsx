"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { TransactionDataBuilder } from "@mysten/sui/transactions";
import { fromBase64, normalizeSuiAddress } from "@mysten/sui/utils";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { DetailList } from "@/components/ui/DetailList";
import { Modal, ModalClose } from "@/components/ui/Dialog";
import {
  addressProblem,
  buildWithdrawal,
  estimateFee,
  formatUnits,
  parseUnits,
  type Holding,
  type Withdrawal,
} from "@/lib/chain/account";
import { NETWORK, explorerTxUrl } from "@/lib/chain/config";
import { dAppKit } from "@/lib/chain/dappKit";
import { chainErrorMessage, findTransaction, suiClient } from "@/lib/chain/escrow";

/** A withdrawal that has been signed. Resending it is safe: Sui runs the same bytes only once. */
interface SignedWithdrawal {
  bytes: Uint8Array;
  signature: string;
  digest: string;
}

interface WithdrawModalProps {
  holding: Holding;
  sender: string;
  onClose: () => void;
  /** The balance may have changed. */
  onSent: () => void;
}

type Step = "form" | "review" | "done";

const TITLES: Record<Step, string> = {
  form: "Withdraw",
  review: "Check the details",
  done: "Withdrawal sent",
};

export default function WithdrawModal({ holding, sender, onClose, onSent }: WithdrawModalProps) {
  const { token } = holding;
  const [step, setStep] = useState<Step>("form");
  const [addressText, setAddressText] = useState("");
  const [amountText, setAmountText] = useState("");
  const [everything, setEverything] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<{
    withdrawal: Withdrawal;
    fee: bigint;
    receives: bigint;
  } | null>(null);
  // Signed, but not known to have reached the chain.
  const [unconfirmed, setUnconfirmed] = useState<SignedWithdrawal | null>(null);
  const [digest, setDigest] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  // Each step is announced by its title.
  useEffect(() => {
    if (step !== "form") headingRef.current?.focus();
  }, [step]);

  const handleClose = () => {
    if (!busy) onClose();
  };

  const handleReview = async () => {
    setError(null);
    const typed = parseUnits(amountText);
    if (!everything && typed === null) {
      setError("Enter an amount above 0, with up to nine decimal places.");
      return;
    }
    const total = everything ? holding.units : typed!;
    if (total > holding.units) {
      setError(`You have ${formatUnits(holding.units)} ${token}. Enter a smaller amount.`);
      return;
    }

    setBusy(true);
    try {
      const problem = await addressProblem(addressText, sender);
      if (problem) {
        setError(problem);
        return;
      }
      const withdrawal: Withdrawal = {
        token,
        // SUI pays its own fee, so "everything" has to be worked out on chain.
        units: everything && token === "SUI" ? "all" : total,
        sender,
        recipient: normalizeSuiAddress(addressText.trim()),
      };
      const fee = await estimateFee(withdrawal);
      const receives = withdrawal.units === "all" ? total - fee : total;
      setReview({ withdrawal, fee, receives });
      setStep("review");
    } catch (err) {
      const message = chainErrorMessage(err, "Unable to check this withdrawal. Try again in a moment.");
      setError(
        /enough/.test(message)
          ? token === "SUI"
            ? everything
              ? "There isn’t enough here to cover the network fee."
              : "That leaves too little for the network fee. Send less, or choose everything."
            : "You need a little SUI in this account to pay the network fee."
          : message
      );
    } finally {
      setBusy(false);
    }
  };

  /** Sends a signed withdrawal, then works out what really happened before saying anything. */
  const send = async (signed: SignedWithdrawal) => {
    let result = await findTransaction(signed.digest);
    if (typeof result === "string") {
      try {
        result = await suiClient.executeTransaction({
          transaction: signed.bytes,
          signatures: [signed.signature],
          include: { effects: true, objectTypes: true },
        });
      } catch {
        result = await findTransaction(signed.digest);
      }
    }

    if (typeof result === "string") {
      setUnconfirmed(signed);
      setError(
        "We couldn’t confirm the withdrawal. Check again to resend the same one. It can’t be sent twice. If you close this, look at your balance before starting a new one."
      );
      return;
    }
    setUnconfirmed(null);
    if (result.FailedTransaction) {
      setError("The withdrawal failed, so only the network fee was spent. Go back and try again.");
      onSent();
      return;
    }
    setDigest(signed.digest);
    setStep("done");
    await suiClient.waitForTransaction({ digest: signed.digest }).catch(() => undefined);
    onSent();
  };

  const handleConfirm = async () => {
    if (!review) return;
    setError(null);
    setBusy(true);
    try {
      if (unconfirmed) {
        await send(unconfirmed);
        return;
      }
      const signed = await dAppKit.signTransaction({
        transaction: buildWithdrawal(review.withdrawal),
      });
      const bytes = fromBase64(signed.bytes);
      await send({
        bytes,
        signature: signed.signature,
        digest: TransactionDataBuilder.getDigestFromBytes(bytes),
      });
    } catch (err) {
      setError(chainErrorMessage(err, "The withdrawal didn’t go through. Try again in a moment."));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (step === "form") void handleReview();
    else if (step === "review") void handleConfirm();
    else onClose();
  };

  return (
    <Modal
      open
      onClose={handleClose}
      labelledBy="withdraw-title"
      initialFocus={addressRef}
      className="sm:max-w-[480px]"
    >
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
          <h2 ref={headingRef} id="withdraw-title" tabIndex={-1} className="type-title pt-2">
            {step === "form" ? `${TITLES.form} ${token}` : TITLES[step]}
          </h2>
          <div className="-mr-2">
            <ModalClose onClose={handleClose} />
          </div>
        </header>

        <div className="modal-body space-y-5 pb-2 pt-4">
          {step === "form" && (
            <>
              <div>
                <label htmlFor="withdraw-address" className="type-label mb-2 block">
                  To this Sui address
                </label>
                <input
                  ref={addressRef}
                  id="withdraw-address"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={addressText}
                  onChange={(e) => {
                    setError(null);
                    setAddressText(e.target.value);
                  }}
                  placeholder="0x…"
                  className="field font-mono"
                />
                <p className="type-help mt-2">
                  {NETWORK === "testnet"
                    ? "Testnet coins only work on Sui Testnet. Don’t send them to an exchange."
                    : `For an exchange, use its ${token} deposit address on the Sui network.`}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <label htmlFor="withdraw-amount" className="type-label">
                    Amount in {token}
                  </label>
                  <span className="type-help tabular-nums">{formatUnits(holding.units)} available</span>
                </div>
                <input
                  id="withdraw-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  disabled={everything}
                  value={everything ? formatUnits(holding.units) : amountText}
                  onChange={(e) => {
                    setError(null);
                    setAmountText(e.target.value);
                  }}
                  placeholder="0.00"
                  className="field tabular-nums disabled:bg-snow disabled:text-ink-muted"
                />
                <label className="mt-1 flex min-h-[44px] w-fit cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={everything}
                    onChange={(e) => {
                      setError(null);
                      setEverything(e.target.checked);
                    }}
                    className="h-5 w-5 accent-ink"
                  />
                  Withdraw everything
                </label>
              </div>
            </>
          )}

          {step === "review" && review && (
            <>
              <div>
                <p className="type-label">To</p>
                <p className="well mt-2 px-4 py-3 font-mono text-[13px] leading-5 text-ink [overflow-wrap:anywhere]">
                  {review.withdrawal.recipient}
                </p>
              </div>
              <DetailList
                items={[
                  {
                    label: "They receive",
                    value: `${review.withdrawal.units === "all" ? "About " : ""}${formatUnits(review.receives)} ${token}`,
                  },
                  { label: "Network fee", value: `About ${formatUnits(review.fee)} SUI` },
                  { label: "Network", value: NETWORK === "mainnet" ? "Sui Mainnet" : "Sui Testnet" },
                ]}
              />
              <p className="type-help">
                Check the first and last characters of the address. A withdrawal can’t be undone.
              </p>
            </>
          )}

          {step === "done" && review && (
            <>
              <p role="status" className="flex items-center gap-2 text-base text-ink-muted">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                {review.withdrawal.units === "all" ? "About " : ""}
                {formatUnits(review.receives)} {token} is at the new address.
              </p>
              <a
                href={explorerTxUrl(digest)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary w-full"
              >
                <span>View on explorer</span>
                <ExternalLink aria-hidden="true" />
              </a>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <footer className="modal-footer">
          {step === "review" && !unconfirmed && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setError(null);
                setStep("form");
              }}
              className="btn btn-secondary"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={step === "done" ? "btn btn-secondary flex-1" : "btn btn-primary flex-1"}
          >
            {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
            <span>
              {step === "form"
                ? "Continue"
                : step === "done"
                  ? "Done"
                  : unconfirmed
                    ? "Check again"
                    : "Withdraw"}
            </span>
          </button>
        </footer>
      </form>
    </Modal>
  );
}
