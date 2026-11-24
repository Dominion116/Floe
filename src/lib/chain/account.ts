import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";
import { COIN_TYPES, CURRENCIES, DECIMALS, type Token } from "./config";
import { suiClient } from "./escrow";

export interface Holding {
  token: Token;
  units: bigint;
}

/** SUI always, and other supported tokens on this network. */
export async function readHoldings(owner: string): Promise<Holding[]> {
  const tokens = CURRENCIES.filter((c): c is Token => c !== "USD");
  return Promise.all(
    tokens.map(async (token) => {
      const { balance } = await suiClient.getBalance({ owner, coinType: COIN_TYPES[token] });
      return { token, units: BigInt(balance.balance) };
    })
  );
}

/** What someone typed, as exact base units. Null if it isn't an amount above zero. */
export function parseUnits(text: string): bigint | null {
  const match = /^(\d{0,12})(?:\.(\d{0,9}))?$/.exec(text.trim());
  if (!match) return null;
  const units = BigInt((match[1] || "0") + (match[2] ?? "").padEnd(DECIMALS, "0"));
  return units > BigInt(0) ? units : null;
}

/** Every digit, so a balance is never rounded up past what is there. */
export function formatUnits(units: bigint): string {
  const digits = units.toString().padStart(DECIMALS + 1, "0");
  const fraction = digits.slice(-DECIMALS).replace(/0+$/, "").padEnd(2, "0");
  return `${BigInt(digits.slice(0, -DECIMALS)).toLocaleString("en-US")}.${fraction}`;
}

/** Reserved system addresses. Money sent there is gone. */
const FIRST_USER_ADDRESS = BigInt(0x10000);

/** Why money shouldn't go to this address, or null if it looks safe. */
export async function addressProblem(text: string, owner: string): Promise<string | null> {
  const value = text.trim();
  if (!isValidSuiAddress(value)) {
    return "Enter a full Sui address. It starts with 0x and has 64 characters after that.";
  }
  const address = normalizeSuiAddress(value);
  if (address === normalizeSuiAddress(owner)) return "That’s this account. Enter a different address.";
  if (BigInt(address) < FIRST_USER_ADDRESS) return "That’s a system address, so the money would be lost.";
  const { objects } = await suiClient.getObjects({ objectIds: [address] });
  if (!(objects[0] instanceof Error)) {
    return "That’s the ID of an object or contract, not an account, so the money would be lost.";
  }
  return null;
}

export interface Withdrawal {
  token: Token;
  units: bigint | "all";
  sender: string;
  recipient: string;
}

/** The account pays its own gas. Sponsoring these would let anyone drain the gas budget. */
export function buildWithdrawal({ token, units, sender, recipient }: Withdrawal): Transaction {
  const tx = new Transaction();
  tx.setSender(sender);
  if (token === "SUI" && units === "all") {
    // Gas comes out of this coin first, so nothing is left behind.
    tx.transferObjects([tx.gas], recipient);
  } else {
    if (units === "all") throw new Error("Only SUI can be sent without an amount");
    tx.transferObjects([tx.coin({ type: COIN_TYPES[token], balance: units })], recipient);
  }
  return tx;
}

/** Runs the withdrawal without sending it. Throws if it would fail. */
export async function estimateFee(withdrawal: Withdrawal): Promise<bigint> {
  // Built first, because simulating an unbuilt transaction makes up the gas it needs.
  const transaction = await buildWithdrawal(withdrawal).build({ client: suiClient });
  const result = await suiClient.simulateTransaction({
    transaction,
    include: { effects: true },
  });
  if (!result.Transaction) {
    throw new Error(result.FailedTransaction.status.error?.message ?? "The withdrawal would fail");
  }
  const { computationCost, storageCost, storageRebate } = result.Transaction.effects.gasUsed;
  const fee = BigInt(computationCost) + BigInt(storageCost) - BigInt(storageRebate);
  return fee > BigInt(0) ? fee : BigInt(0);
}
