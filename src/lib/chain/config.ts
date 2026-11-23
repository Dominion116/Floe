import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";

export const NETWORK: "testnet" | "mainnet" =
  process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const RPC_URL =
  process.env.NEXT_PUBLIC_SUI_RPC_URL || `https://fullnode.${NETWORK}.sui.io:443`;

export const GRAPHQL_URL = `https://graphql.${NETWORK}.sui.io/graphql`;

const rawPackageId = process.env.NEXT_PUBLIC_FLOE_PACKAGE_ID ?? "";
/** Null until the contract has been deployed and configured. */
export const PACKAGE_ID: string | null =
  isValidSuiAddress(normalizeSuiAddress(rawPackageId)) && BigInt(normalizeSuiAddress(rawPackageId)) > BigInt(0)
    ? normalizeSuiAddress(rawPackageId)
    : null;

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const ENOKI_PUBLIC_KEY = process.env.NEXT_PUBLIC_ENOKI_API_KEY ?? "";
/** Null until Google login and gas sponsorship have been configured. */
export const ENOKI =
  GOOGLE_CLIENT_ID && ENOKI_PUBLIC_KEY
    ? { googleClientId: GOOGLE_CLIENT_ID, publicKey: ENOKI_PUBLIC_KEY }
    : null;

export type Token = "SUI" | "LOFI";
export type Currency = "USD" | Token;

/** Both coins use nine decimals. */
export const DECIMALS = 9;

export const COIN_TYPES: Record<Token, string> = {
  SUI: "0x2::sui::SUI",
  LOFI: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI",
};

/** $LOFI is deployed on mainnet only. */
export const CURRENCIES: Currency[] =
  NETWORK === "mainnet" ? ["USD", "SUI", "LOFI"] : ["USD", "SUI"];

/** Dollar links are funded in SUI. */
export const fundingToken = (currency: Currency): Token => (currency === "LOFI" ? "LOFI" : "SUI");

/** Must match CLEAN_WATER_TREASURY in move/sources/escrow.move. */
export const WATER_TREASURY =
  "0xb1a99b2135e594ed62506352a79362a146dda11398cacb187cb42533b66ce69c";

export const LINK_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export const explorerTxUrl = (digest: string) => `https://suiscan.xyz/${NETWORK}/tx/${digest}`;
export const explorerAccountUrl = (address: string) =>
  `https://suiscan.xyz/${NETWORK}/account/${address}`;
