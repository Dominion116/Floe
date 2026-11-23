export type CardThemeId = 'glacial' | 'coffee' | 'birthday' | 'water';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  subtitle: string;
  surfaceClass: string;
  accentClass: string;
  iconName: string;
}

export type EscrowStatus = 'pending' | 'claimed' | 'expired' | 'reclaimed';

export interface PaymentLinkRecord {
  id: string; // escrowId or local generated ID
  ephemeralPrivateKey: string; // stored in fragment for sharing, stored locally for sender history
  ephemeralPublicKey: string;
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
