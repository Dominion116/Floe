"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { GiftReveal } from "@/components/claim/GiftReveal";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { DetailList, type Detail } from "@/components/ui/DetailList";
import { LiveValue } from "@/components/ui/LiveValue";
import { explorerTxUrl, type Token } from "@/lib/chain/config";
import { formatCurrency, maskAddress } from "@/lib/utils";

interface PostClaimViewProps {
  amount: number;
  token: Token;
  recipientAddress: string;
  txDigest: string;
  hasWaterDonation: boolean;
  gift: { giftId: string; privateKey: string } | null;
}

export function PostClaimView({
  amount,
  token,
  recipientAddress,
  txDigest,
  hasWaterDonation,
  gift,
}: PostClaimViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(recipientAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const details: Detail[] = [
    {
      label: "Your Sui address",
      value: (
        <button
          type="button"
          onClick={handleCopyAddress}
          className="-my-2.5 -mr-2 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 font-mono text-[13px]"
          aria-label={copied ? "Address copied" : "Copy your Sui address"}
        >
          {maskAddress(recipientAddress)}
          {copied ? (
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          )}
        </button>
      ),
    },
    { label: "Transaction", value: maskAddress(txDigest), mono: true },
    { label: "Gas paid", value: "$0.00" },
  ];
  details.unshift({
    label: "Value now",
    value: <LiveValue amount={amount} currency={token} />,
  });
  if (hasWaterDonation) details.push({ label: "Clean water", value: "10 gallons" });

  return (
    <div className="card space-y-6 p-6 text-center sm:p-8">
      <div>
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
        <h1 className="type-headline mt-4">{formatCurrency(amount, token)} is yours</h1>
        <p className="mt-2 text-base text-ink-muted">
          It’s in your own Sui account. Floe can’t move it.
        </p>
      </div>

      {gift && <GiftReveal {...gift} />}

      <DetailList items={details} />

      <div className="grid gap-3 min-[400px]:grid-cols-2">
        <CreateLinkButton className="btn btn-primary col-span-full">Send to a friend</CreateLinkButton>
        <Link href="/account" className="btn btn-secondary px-4">
          Account and withdraw
        </Link>
        <a
          href={explorerTxUrl(txDigest)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary px-4"
        >
          <span>View on explorer</span>
          <ExternalLink aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
