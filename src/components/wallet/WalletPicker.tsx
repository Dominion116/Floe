"use client";

import { useState } from "react";
import { useWalletConnection, useWallets, type UiWallet } from "@mysten/dapp-kit-react";
import { Loader2 } from "lucide-react";
import { dAppKit } from "@/lib/chain/dappKit";
import { chainErrorMessage } from "@/lib/chain/escrow";
import { maskAddress } from "@/lib/utils";

interface WalletPickerProps {
  label: string;
  disabled?: boolean;
}

/** Connects the wallet that will sign. Shows the connected account once there is one. */
export function WalletPicker({ label, disabled }: WalletPickerProps) {
  const wallets = useWallets({ dAppKit });
  const connection = useWalletConnection({ dAppKit });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (wallet: UiWallet) => {
    setError(null);
    setConnecting(wallet.name);
    try {
      await dAppKit.connectWallet({ wallet });
    } catch (err) {
      setError(chainErrorMessage(err, `Unable to connect ${wallet.name}. Open it, then try again.`));
    } finally {
      setConnecting(null);
    }
  };

  if (connection.account) {
    return (
      <div>
        <p className="type-label mb-2">{label}</p>
        <div className="well flex min-h-[56px] items-center justify-between gap-3 py-1 pl-4 pr-1">
          <span className="flex min-w-0 items-center gap-3">
            <img src={connection.wallet?.icon} alt="" className="h-6 w-6 shrink-0 rounded-md" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">
                {connection.wallet?.name}
              </span>
              <span className="block font-mono text-[13px] leading-5 text-ink-muted">
                {maskAddress(connection.account.address)}
              </span>
            </span>
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void dAppKit.disconnectWallet()}
            className="btn btn-sm btn-ghost shrink-0"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="type-label mb-2">{label}</p>
      {wallets.length === 0 ? (
        <p className="well px-4 py-3 text-sm text-ink-muted">
          No Sui wallet found. Install one in this browser, then reload the page.
        </p>
      ) : (
        <ul className="grid gap-2">
          {wallets.map((wallet) => (
            <li key={wallet.name}>
              <button
                type="button"
                disabled={disabled || connecting !== null}
                aria-busy={connecting === wallet.name}
                onClick={() => void handleConnect(wallet)}
                className="btn btn-secondary w-full justify-start px-4"
              >
                <img src={wallet.icon} alt="" className="h-6 w-6 shrink-0 rounded-md" />
                <span className="flex-1 truncate text-left">{wallet.name}</span>
                {connecting === wallet.name && (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
