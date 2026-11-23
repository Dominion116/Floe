export type CardThemeId = 'glacial' | 'coffee' | 'birthday' | 'water';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  subtitle: string;
  surfaceClass: string;
  accentClass: string;
  iconName: string;
}

/** Dollar price of one token. */
export interface Rates {
  SUI: number;
  LOFI: number;
}

export type EscrowStatus = 'pending' | 'claimed' | 'expired' | 'reclaimed';

/** Saved in localStorage. Never add the private key here: it lives only in the link's # fragment. */
export interface PaymentLinkRecord {
  id: string; // escrowId or local generated ID
  ephemeralPublicKey: string;
  // The same amount in each currency at the live price when the link was created.
  // `currency` is the one the sender entered, and the only one that stays exact.
  amountUsd: number;
  amountSui: number;
  amountLofi: number;
  currency: 'USD' | 'SUI' | 'LOFI';
  recipientNote: string;
  themeId: CardThemeId;
  waterDonationUsd: number;
  waterDonationSui: number;
  hasWaterDonation: boolean;
  createdAt: number;
  expiresAt: number;
  status: EscrowStatus;
  claimedByMasked?: string;
  claimedAt?: number;
  viewsCount?: number;
}

export interface ClaimVerificationState {
  step: 'idle' | 'authenticating' | 'verifying' | 'claiming' | 'success' | 'error';
  errorMessage?: string;
}
