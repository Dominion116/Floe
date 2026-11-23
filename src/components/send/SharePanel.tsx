"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { AtSign, Check, Copy, Download, MessageCircle, MessageSquare, Send } from "lucide-react";

interface SharePanelProps {
  claimUrl: string;
  amountDisplay: string;
  /** Called once the sender has copied, shared or downloaded the link. */
  onSaved: () => void;
}

export function SharePanel({ claimUrl, amountDisplay, onSaved }: SharePanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      setCopyState("copied");
      onSaved();
      setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      // Some in-app browsers block clipboard access
      inputRef.current?.focus();
      inputRef.current?.select();
      setCopyState("failed");
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const anchor = document.createElement("a");
    anchor.href = qrRef.current.toDataURL("image/png");
    anchor.download = "floe-payment-link.png";
    anchor.click();
    onSaved();
  };

  const message = `I sent you ${amountDisplay} with Floe. Claim it here: ${claimUrl}`;
  const text = encodeURIComponent(message);

  const channels = [
    { name: "WhatsApp", icon: MessageCircle, href: `https://api.whatsapp.com/send?text=${text}` },
    {
      name: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(claimUrl)}&text=${encodeURIComponent(`I sent you ${amountDisplay} with Floe.`)}`,
    },
    { name: "iMessage", icon: MessageSquare, href: `sms:?&body=${text}` },
    { name: "X message", icon: AtSign, href: `https://twitter.com/messages/compose?text=${text}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="private-claim-url" className="type-label block mb-2">
          Private link
        </label>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <input
            ref={inputRef}
            id="private-claim-url"
            type="text"
            readOnly
            value={claimUrl}
            onFocus={(e) => e.currentTarget.select()}
            onCopy={onSaved}
            className="field flex-1 min-w-0 truncate font-mono"
          />
          <button type="button" onClick={handleCopy} className="btn btn-primary shrink-0">
            {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span>{copyState === "copied" ? "Copied" : "Copy link"}</span>
          </button>
        </div>
        <p role="status" className="type-help mt-2">
          {copyState === "failed"
            ? "Copy is blocked in this browser. The link is selected, so you can copy it yourself."
            : "Save it now. Floe doesn’t keep a copy, so you won’t see it again."}
        </p>
      </div>

      <div>
        <h3 className="type-label mb-2">Send it with</h3>
        <ul className="grid grid-cols-2 gap-2">
          {channels.map(({ name, icon: Icon, href }) => (
            <li key={name}>
              <a
                href={href}
                onClick={onSaved}
                target={href.startsWith("sms:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary w-full"
              >
                <Icon aria-hidden="true" />
                <span>{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="well flex flex-col items-center gap-4 p-4 min-[400px]:flex-row">
        <div className="shrink-0 rounded-xl bg-white p-2">
          <QRCodeCanvas
            ref={qrRef}
            value={claimUrl}
            size={480}
            marginSize={2}
            level="M"
            role="img"
            aria-label="QR code for your payment link"
            style={{ width: 112, height: 112 }}
          />
        </div>
        <div className="text-center min-[400px]:text-left">
          <h3 className="type-label">In person?</h3>
          <p className="type-help mt-1">Let them scan this with their camera.</p>
          <button
            type="button"
            onClick={handleDownloadQr}
            className="btn btn-sm btn-ghost mt-1 min-[400px]:-ml-4"
          >
            <Download aria-hidden="true" />
            <span>Download QR code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
