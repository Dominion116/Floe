import type { Currency, Token } from "./chain/config";

export type CardThemeId = "glacial" | "coffee" | "birthday" | "water";

export interface CardTheme {
  id: CardThemeId;
  name: string;
  subtitle: string;
  surfaceClass: string;
  accentClass: string;
  iconName: string;
}

/** Dollar price of one token. */
export type Rates = Record<Token, number>;

/** `creating` means the payment was signed but its escrow isn't confirmed yet. */
export type EscrowStatus = "creating" | "pending" | "claimed" | "expired" | "reclaimed";

/**
 * A sender's history entry, saved in localStorage. The chain is the source of truth for status.
 * Never add the private key here: it lives only in the link's # fragment.
 */
export interface PaymentLinkRecord {
  /** Digest of the create transaction. Known before it is sent, so it identifies the record. */
  digest: string;
  escrowId: string | null;
  sender: string;
  /** What the sender typed. */
  currency: Currency;
  enteredAmount: number;
  /** What the escrow holds, in base units. */
  token: Token;
  amountUnits: string;
  recipientNote: string;
  themeId: CardThemeId;
  hasWaterDonation: boolean;
  createdAt: number;
  expiresAt: number;
  status: EscrowStatus;
  claimedBy?: string;
  closedAt?: number;
}

export interface ClaimVerificationState {
  step: "idle" | "authenticating" | "verifying" | "claiming" | "success";
}
