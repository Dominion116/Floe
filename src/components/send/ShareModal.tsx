"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, MessageSquare, Send, X, ExternalLink, QrCode } from "lucide-react";

interface ShareModalProps {
  claimUrl: string;
  amountDisplay: string;
  recipientNote: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({
  claimUrl,
  amountDisplay,
  recipientNote,
  isOpen,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = encodeURIComponent(
    `Hey! I sent you ${amountDisplay} with Floe. Claim it here: ${claimUrl}`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(claimUrl)}&text=${encodeURIComponent(`I sent you ${amountDisplay} on Floe!`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-mist shadow-floating p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full text-ink-muted hover:text-ink hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <span className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Escrow Created On Sui
          </span>
          <h3 id="share-modal-title" className="font-serif text-2xl sm:text-3xl font-light text-ink tracking-[-0.03em]">
            Your link is ready to share
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted">
            Send this private link to your recipient via your favorite app.
          </p>
        </div>

        {/* Summary pill */}
        <div className="p-4 rounded-2xl bg-snow border border-mist/40 text-center">
          <span className="font-serif text-3xl text-ink font-light tracking-[-0.03em]">
            {amountDisplay}
          </span>
          {recipientNote && (
            <p className="text-xs text-ink-muted italic mt-1">
              &ldquo;{recipientNote}&rdquo;
            </p>
          )}
        </div>

        {/* Share Link Field with Copy */}
        <div className="space-y-2">
          <label htmlFor="private-claim-url" className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
            Private Claim URL
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl border border-mist/60 bg-white focus-within:border-ink">
            <input
              id="private-claim-url"
              type="text"
              readOnly
              value={claimUrl}
              className="flex-1 text-xs font-mono text-ink bg-transparent outline-none truncate px-1"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all min-h-[38px] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-ink text-white hover:bg-ink-soft"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs font-mono text-ink-muted">
            🔒 Private key is in the URL hash fragment. Zero server knowledge.
          </p>
        </div>

        {/* Deep link app buttons */}
        <div className="space-y-2">
          <span className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
            Share directly
          </span>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-mist/60 hover:border-emerald-500 hover:bg-emerald-50/40 text-ink text-xs font-medium transition-all active:scale-[0.97] min-h-[44px]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-mist/60 hover:border-sky-500 hover:bg-sky-50/40 text-ink text-xs font-medium transition-all active:scale-[0.97] min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
              <span>Telegram</span>
            </a>
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-mist/60 hover:border-ink hover:bg-snow text-ink text-xs font-medium transition-all active:scale-[0.97] min-h-[44px]"
            >
              <QrCode className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
              <span>{showQr ? "Hide QR" : "Show QR"}</span>
            </button>
          </div>
        </div>

        {/* QR Code toggle box */}
        {showQr && (
          <div className="pt-2 flex flex-col items-center justify-center space-y-2 bg-snow p-4 rounded-2xl border border-mist/40 animate-in fade-in">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-mist/40">
              <QRCodeSVG value={claimUrl} size={150} level="M" />
            </div>
            <span className="text-xs font-mono text-ink-muted">
              Scan with camera to claim
            </span>
          </div>
        )}

        {/* Footer Done action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full btn-secondary py-3.5 rounded-full min-h-[44px] text-xs sm:text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
