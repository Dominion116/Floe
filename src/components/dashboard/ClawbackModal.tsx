"use client";

import { useState } from "react";
import { AlertTriangle, X, CheckCircle2, RefreshCw } from "lucide-react";
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

  if (!isOpen || !link) return null;

  const handleExecute = () => {
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

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="clawback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl border border-mist shadow-floating p-6 space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full text-ink-muted hover:text-ink hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-2xl font-light text-ink tracking-[-0.03em]">Escrow Destroyed</h3>
            <p className="text-xs text-ink-muted">
              {formatCurrency(link.amountUsd, link.currency)} has been refunded to your wallet.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 id="clawback-modal-title" className="font-serif text-2xl font-light text-ink tracking-[-0.03em]">
                Cancel & Refund?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                This will trigger an atomic smart contract transaction on Sui that destroys the escrow object and refunds{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(link.amountUsd, link.currency)}
                </span>{" "}
                to your wallet.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-snow border border-mist/40 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-muted">Escrow ID:</span>
                <span className="text-ink truncate max-w-[140px]">{link.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Refund Amount:</span>
                <span className="text-emerald-700 font-semibold">
                  {formatCurrency(link.amountUsd, link.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecute}
                className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-subtle active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Executing reclaim_escrow...</span>
                  </>
                ) : (
                  <span>Confirm Cancel & Refund</span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full btn-secondary py-3 rounded-full min-h-[44px] text-xs sm:text-sm font-medium"
              >
                Keep Link Active
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
