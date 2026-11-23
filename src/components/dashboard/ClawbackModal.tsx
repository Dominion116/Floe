"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { DetailList } from "@/components/ui/DetailList";
import { Modal, ModalClose } from "@/components/ui/Dialog";
import { PaymentLinkRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ClawbackModalProps {
  link: PaymentLinkRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClawback: (id: string) => void;
}

export function ClawbackModal({
  link,
  isOpen,
  onClose,
  onConfirmClawback,
}: ClawbackModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExecute = () => {
    if (!link) return;
    setIsProcessing(true);
    // Simulate atomic Move reclaim_escrow PTB
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onConfirmClawback(link.id);
        onClose();
      }, 1200);
    }, 700);
  };

  const amount = link ? formatCurrency(link.amountUsd, link.currency) : "";

  return (
    <Modal
      open={isOpen && !!link}
      onClose={onClose}
      role="alertdialog"
      labelledBy="clawback-modal-title"
      describedBy="clawback-modal-description"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
        <h2 id="clawback-modal-title" className="type-title pt-2">
          {success ? `${amount} refunded` : `Cancel and refund ${amount}?`}
        </h2>
        <div className="-mr-2">
          <ModalClose onClose={onClose} />
        </div>
      </header>

      <div className="modal-body space-y-4 pt-2 pb-2">
        {success ? (
          <p
            id="clawback-modal-description"
            role="status"
            className="flex items-center gap-2 pb-4 text-base text-ink-muted"
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
                  { label: "Note", value: link.recipientNote },
                  { label: "Escrow", value: link.id, mono: true },
                ]}
              />
            )}
          </>
        )}
      </div>

      {!success && (
        <footer className="modal-footer flex-col sm:flex-row-reverse">
          <button
            type="button"
            disabled={isProcessing}
            aria-busy={isProcessing}
            onClick={handleExecute}
            className="btn btn-danger sm:flex-1"
          >
            {isProcessing && <Loader2 className="animate-spin" aria-hidden="true" />}
            <span>Cancel & refund</span>
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary sm:flex-1">
            Keep link active
          </button>
        </footer>
      )}
    </Modal>
  );
}
