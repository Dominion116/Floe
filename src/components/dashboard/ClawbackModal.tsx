"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { DetailList } from "@/components/ui/DetailList";
import { Modal, ModalClose } from "@/components/ui/Dialog";
import { WalletPicker } from "@/components/wallet/WalletPicker";
import { dAppKit } from "@/lib/chain/dappKit";
import { buildReclaim, chainErrorMessage, fromUnits, readEscrows } from "@/lib/chain/escrow";
import { updateLink } from "@/lib/storage";
import type { PaymentLinkRecord } from "@/lib/types";
import { formatCurrency, maskAddress } from "@/lib/utils";

interface ClawbackModalProps {
  link: PaymentLinkRecord | null;
  onClose: () => void;
  /** The link's status may have changed on chain. */
  onChanged: () => void;
}

export default function ClawbackModal({ link, onClose, onChanged }: ClawbackModalProps) {
  const account = useCurrentAccount({ dAppKit });
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSender = !!link && account?.address === link.sender;

  const handleClose = () => {
    if (isProcessing) return;
    setSuccess(false);
    setError(null);
    onClose();
  };

  const handleExecute = async () => {
    if (!link?.escrowId) return;
    if (!isSender) {
      setError(
        account
          ? `Only the wallet that created this link can refund it. Connect ${maskAddress(link.sender)}.`
          : "Choose the wallet that created this link."
      );
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const escrow = (await readEscrows([link.escrowId])).get(link.escrowId);
      if (escrow === undefined) throw new Error("Unreadable escrow");
      if (escrow === null) {
        setError("This link was already claimed or refunded.");
        onChanged();
        return;
      }

      const result = await dAppKit.signAndExecuteTransaction({ transaction: buildReclaim(escrow) });
      if (result.FailedTransaction) {
        setError("The refund didn’t go through. The link may have just been claimed.");
        onChanged();
        return;
      }
      updateLink(link.digest, { status: "reclaimed", closedAt: Date.now() });
      setSuccess(true);
      onChanged();
    } catch (err) {
      setError(chainErrorMessage(err, "The refund didn’t go through. Try again in a moment."));
    } finally {
      setIsProcessing(false);
    }
  };

  const amount = link ? formatCurrency(fromUnits(link.amountUnits), link.token) : "";

  return (
    <Modal
      open={!!link}
      onClose={handleClose}
      role="alertdialog"
      labelledBy="clawback-modal-title"
      describedBy="clawback-modal-description"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
        <h2 id="clawback-modal-title" className="type-title pt-2">
          {success ? `${amount} refunded` : `Cancel and refund ${amount}?`}
        </h2>
        <div className="-mr-2">
          <ModalClose onClose={handleClose} />
        </div>
      </header>

      <div className="modal-body space-y-4 pt-2 pb-2">
        {success ? (
          <p
            id="clawback-modal-description"
            role="status"
            className="flex items-center gap-2 text-base text-ink-muted"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            The money is back in your wallet.
          </p>
        ) : (
          <>
            <p id="clawback-modal-description" className="text-base text-ink-muted">
              The link stops working for anyone who has it, and the money returns to your wallet.
            </p>
            {link && (
              <DetailList
                items={[
                  { label: "Refund", value: amount },
                  ...(link.recipientNote ? [{ label: "Note", value: link.recipientNote }] : []),
                  { label: "Created by", value: maskAddress(link.sender), mono: true },
                ]}
              />
            )}
            <WalletPicker label="Refund to" disabled={isProcessing} />
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </>
        )}
      </div>

      <footer className="modal-footer flex-col sm:flex-row-reverse">
        {success ? (
          <button type="button" onClick={handleClose} className="btn btn-secondary sm:flex-1">
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={isProcessing}
              aria-busy={isProcessing}
              onClick={() => void handleExecute()}
              className="btn btn-danger sm:flex-1"
            >
              {isProcessing && <Loader2 className="animate-spin" aria-hidden="true" />}
              <span>Cancel & refund</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleClose}
              className="btn btn-secondary sm:flex-1"
            >
              Keep link active
            </button>
          </>
        )}
      </footer>
    </Modal>
  );
}
