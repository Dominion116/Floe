"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletConnection } from "@mysten/dapp-kit-react";
import { isEnokiWallet } from "@mysten/enoki";
import { ArrowUpRight, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import WithdrawModal from "@/components/account/WithdrawModal";
import { CreateLinkButton, useCreateLink } from "@/components/create/CreateLinkProvider";
import { LiveValue } from "@/components/ui/LiveValue";
import { WalletPicker } from "@/components/wallet/WalletPicker";
import { NETWORK, explorerAccountUrl, type Token } from "@/lib/chain/config";
import { formatUnits, readHoldings, type Holding } from "@/lib/chain/account";
import { dAppKit } from "@/lib/chain/dappKit";
import { fromUnits } from "@/lib/chain/escrow";

export default function AccountView() {
  const connection = useWalletConnection({ dAppKit });
  const { createdCount } = useCreateLink();
  const address = connection.account?.address;

  // Kept with the address, so one account's balance is never shown for another.
  const [loaded, setLoaded] = useState<{ address: string; holdings: Holding[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawing, setWithdrawing] = useState<Token | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const refresh = useCallback(async () => {
    if (!address) return;
    setRefreshing(true);
    try {
      const holdings = await readHoldings(address);
      setLoaded({ address, holdings });
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, [address]);

  // Runs again when the create modal spends from this account.
  useEffect(() => {
    void refresh();
  }, [refresh, createdCount]);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2500);
  };

  if (connection.status === "connecting" || connection.status === "reconnecting") {
    return <AccountSkeleton />;
  }

  if (!address || !connection.wallet) {
    return (
      <div className="space-y-4">
        <WalletPicker label="Log in with the account you claimed with" />
        <p className="type-help">
          Use the same Google account each time. A different one opens a different account.
        </p>
      </div>
    );
  }

  const holdings = loaded?.address === address ? loaded.holdings : null;
  const isGoogle = isEnokiWallet(connection.wallet);
  const held = holdings?.find((h) => h.token === withdrawing);

  return (
    <div className="space-y-4">
      <section aria-labelledby="balance-heading" className="rounded-3xl bg-frost-light p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="balance-heading" className="text-sm font-medium text-ink">
            Balance
          </h2>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="Refresh balance"
            className="btn-icon -my-2 -mr-2 disabled:opacity-50"
          >
            <RefreshCw
              className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              aria-hidden="true"
            />
          </button>
        </div>

        {failed && (
          <p role="alert" className="mt-3 rounded-2xl bg-warning-fill px-4 py-3 text-sm text-warning">
            Unable to reach Sui{holdings ? ", so this may be out of date" : ""}. Refresh to try again.
          </p>
        )}

        {!holdings && !failed && (
          <p role="status" className="mt-4 text-base text-ink/75">
            Checking your balance…
          </p>
        )}

        {holdings?.map(({ token, units }) => (
          <div key={token} className="mt-4">
            <p className="type-figure text-4xl [overflow-wrap:anywhere] sm:text-5xl">
              {formatUnits(units)} <span className="font-sans text-xl tracking-normal">{token}</span>
            </p>
            <p className="mt-1 text-sm tabular-nums text-ink/75">
              {NETWORK === "testnet" ? (
                "Testnet coins have no real value"
              ) : (
                <LiveValue amount={fromUnits(units)} currency={token} />
              )}
            </p>
            <button
              type="button"
              disabled={units === BigInt(0)}
              onClick={() => setWithdrawing(token)}
              className="btn btn-primary mt-4 w-full"
            >
              <ArrowUpRight aria-hidden="true" />
              <span>Withdraw {token}</span>
            </button>
          </div>
        ))}

        <CreateLinkButton className="btn btn-secondary mt-3 w-full">
          Send with a new link
        </CreateLinkButton>
      </section>

      <section aria-labelledby="address-heading" className="card p-6 sm:p-8">
        <h2 id="address-heading" className="type-title">
          Your Sui address
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {NETWORK === "testnet" ? "For Sui Testnet coins only." : "For coins on Sui only."}
        </p>
        <div className="mt-4 flex flex-col items-center gap-4 min-[400px]:flex-row min-[400px]:items-start">
          <div className="shrink-0 rounded-xl border border-mist/70 bg-white p-2">
            <QRCodeCanvas
              value={address}
              size={320}
              marginSize={2}
              role="img"
              aria-label="QR code for your Sui address"
              style={{ width: 112, height: 112 }}
            />
          </div>
          <div className="min-w-0">
            <p className="select-all font-mono text-[13px] leading-5 text-ink [overflow-wrap:anywhere]">
              {address}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={handleCopy} className="btn btn-sm btn-secondary">
                {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                <span aria-live="polite">
                  {copyState === "copied"
                    ? "Copied"
                    : copyState === "failed"
                      ? "Copy blocked"
                      : "Copy address"}
                </span>
              </button>
              <a
                href={explorerAccountUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost"
              >
                <span>Explorer</span>
                <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="well flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-help">
          {isGoogle
            ? "Logged in with Google. There’s no seed phrase, so keep access to that Google account."
            : `Connected with ${connection.wallet.name}.`}
        </p>
        <button
          type="button"
          onClick={() => void dAppKit.disconnectWallet()}
          className="btn btn-sm btn-secondary shrink-0"
        >
          {isGoogle ? "Log out" : "Disconnect"}
        </button>
      </div>

      {held && (
        <WithdrawModal
          key={`${address}:${held.token}`}
          holding={held}
          sender={address}
          onClose={() => setWithdrawing(null)}
          onSent={() => void refresh()}
        />
      )}
    </div>
  );
}
