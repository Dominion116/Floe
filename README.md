# Floe — The 2-Second Payment Link on Sui

[![Live Demo](https://img.shields.io/badge/Live_Demo-floeonsui.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://floeonsui.vercel.app)
[![Sui Network](https://img.shields.io/badge/Blockchain-Sui_Network-4C72B0?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io)
[![Move 2024](https://img.shields.io/badge/Smart_Contract-Move_2024-22c55e?style=for-the-badge)](https://docs.sui.io/concepts/sui-move-concepts)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/Hackathon-Lofi_The_Yeti_CLAY_III-00B4D8?style=for-the-badge)](https://hackathon.lofitheyeti.com/)

> Consumer-grade payment links on Sui. Senders create a link in 5 seconds; recipients tap "Continue with Google" and receive funds in under 2 seconds with zero gas fees and zero wallet setup.

---

## Features

- ✅ **Zero Seed Phrases (zkLogin):** Recipients authenticate via Google or Apple OAuth 2.0 without ever generating or securing a 12-to-24 word seed phrase.
- ✅ **Zero Gas Fees for Receivers:** 100% of claim transactions are gas-sponsored via Enoki and Sui Sponsored Transactions.
- ✅ **Trustless URL Fragment Cryptography:** Ephemeral Ed25519 private keys are stored strictly in the URL hash fragment (`#`), ensuring keys never touch web servers or analytics CDNs.
- ✅ **Lofi Clean Ocean Mission:** Built-in "Round up 10¢ to Clean Water" toggle that directs micro-donations directly to the Lofi Foundation Treasury on-chain.
- ✅ **Sender Safety Timeout & Clawback:** Automated 14-day escrow expiration enabling senders to cancel and refund unclaimed links atomically.
- ✅ **Consumer Currency Display:** Real-time dual display in fiat USD (`$10.00`) alongside native `SUI` and `$LOFI` token equivalents.
- ✅ **Social Share & QR Settlement:** One-tap link sharing for WhatsApp, Telegram, iMessage, and high-contrast dynamic QR codes for in-person payments.
- 🚧 **Multi-Token Splits & Multi-Claim Pools:** Distribute funds across multiple recipients from a single master link (in development).

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SENDER FLOW                                         │
│                                                                                        │
│  1. Sender selects $10 (SUI / $LOFI) + custom gift note + water roundup                │
│  2. Client generates Ephemeral Keypair (ephem_sk, ephem_pk) in memory                   │
│  3. Sender signs PTB: Deposits Coin into shared PaymentEscrow locked to ephem_pk       │
│  4. Client constructs Link: https://floeonsui.vercel.app/claim?id=<EscrowID>#<ephem_sk>│
│  5. Sender shares via WhatsApp / iMessage / Telegram / QR Code                         │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                                         ▼ Shared Link (URL hash # never touches server)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RECIPIENT FLOW                                       │
│                                                                                        │
│  1. Recipient opens link in mobile or desktop browser                                  │
│  2. Client extracts EscrowID from query params and ephem_sk from window.location.hash   │
│  3. Recipient clicks "Continue with Google" (Sui zkLogin OAuth)                         │
│  4. App derives Recipient's deterministic Sui zkLogin address                          │
│  5. Client constructs Claim PTB:                                                       │
│     - Signs recipient address with ephem_sk                                            │
│     - Destination set to derived zkLogin address                                       │
│     - Gas 100% sponsored by Enoki Gas Station                                          │
│  6. Consensus executes in ~400ms: Escrow balance transferred to Recipient              │
│  7. Unboxing animation triggers: Funds immediately spendable                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

Get the Floe web application up and running locally in three commands:

```bash
# 1. Clone repository
git clone https://github.com/your-username/floe.git
cd floe

# 2. Install dependencies (npm strictly required)
npm install

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Installation

### Prerequisites

- **Node.js:** `18.18.0+` or `20.x`
- **npm:** `9.x+` (strict requirement: do not use Yarn, pnpm, or Bun)
- **Sui CLI:** `1.18.0+` (optional, for compiling or testing Move contracts)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/floe.git
   cd floe
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```

> **Note:** As specified in the product constraints, avoid running `npm run build` or `npm run lint` in local development sandboxes.

---

## Usage

### 1. Generating a Payment Link via Client SDK

```typescript
import { generateEphemeralKeypair, buildClaimUrl } from "@/lib/crypto";
import { Transaction } from "@mysten/sui/transactions";

// Step 1: Generate an in-memory ephemeral keypair
const { privateKeyHex, publicKeyHex } = generateEphemeralKeypair();

// Step 2: Build the programmable transaction block (PTB)
const tx = new Transaction();
const [escrowCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(10_000_000_000)]); // 10 SUI
const clockObj = tx.object("0x6");

tx.moveCall({
  target: `${process.env.NEXT_PUBLIC_FLOE_PACKAGE_ID}::escrow::create_escrow`,
  typeArguments: ["0x2::sui::SUI"],
  arguments: [
    escrowCoin,
    tx.pure.vector("u8", Array.from(Buffer.from(publicKeyHex, "hex"))),
    tx.pure.u64(14 * 24 * 60 * 60 * 1000), // 14-day duration (ms)
    tx.pure.u64(100_000_000),             // 0.1 SUI clean water donation
    tx.pure.u8(1),                        // Theme ID (e.g. 1 = Yeti Glacial)
    clockObj,
  ],
});

// Step 3: Construct the trustless URL where secret key lives only in the hash fragment (#)
const claimUrl = buildClaimUrl(
  "https://floeonsui.vercel.app",
  "0xEscrowObjectIdHere",
  privateKeyHex
);

console.log("Shareable Link:", claimUrl);
// Output: https://floeonsui.vercel.app/claim?id=0xEscrowObjectIdHere#ed25519_sk_...
```

### 2. Claiming an Escrow Link (Recipient zkLogin)

```typescript
import { extractKeyFromFragment } from "@/lib/crypto";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// 1. Extract ephemeral secret key from URL fragment
const privateKeyHex = extractKeyFromFragment(window.location.hash);
const ephemeralKeypair = Ed25519Keypair.fromSecretKey(privateKeyHex!);

// 2. Sign recipient address with ephemeral key
const recipientAddress = "0xRecipientZkLoginAddress";
const addressBytes = bcs.Address.serialize(recipientAddress).toBytes();
const signature = await ephemeralKeypair.sign(addressBytes);

// 3. Build sponsored claim transaction
const tx = new Transaction();
tx.moveCall({
  target: `${process.env.NEXT_PUBLIC_FLOE_PACKAGE_ID}::escrow::claim_escrow`,
  typeArguments: ["0x2::sui::SUI"],
  arguments: [
    tx.object("0xEscrowObjectIdHere"),
    tx.pure.vector("u8", Array.from(signature)),
    tx.pure.address(recipientAddress),
    tx.object("0x6"), // Sui Clock
  ],
});
```

### 3. Reclaiming an Expired Escrow (Clawback)

If a link goes unclaimed past its expiration window (default 14 days), the sender can reclaim 100% of the funds:

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${process.env.NEXT_PUBLIC_FLOE_PACKAGE_ID}::escrow::reclaim_escrow`,
  typeArguments: ["0x2::sui::SUI"],
  arguments: [
    tx.object("0xEscrowObjectIdHere"),
    tx.object("0x6"), // Sui Clock
  ],
});
```

---

## API Reference

### Move Smart Contract (`floe::escrow`)

The core escrow contract is implemented in Move 2024 at [`move/sources/escrow.move`](move/sources/escrow.move).

#### `create_escrow<T>`

Locks tokens into a shared escrow object authenticated by the ephemeral public key.

```move
public entry fun create_escrow<T>(
    coin: Coin<T>,
    ephem_pubkey: vector<u8>,
    duration_ms: u64,
    water_cut: u64,
    theme_id: u8,
    clock: &Clock,
    ctx: &mut TxContext
)
```

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `coin` | `Coin<T>` | Yes | The coin object to deposit into escrow |
| `ephem_pubkey` | `vector<u8>` | Yes | 32-byte Ed25519 public key generated client-side |
| `duration_ms` | `u64` | Yes | Expiration duration in milliseconds (e.g. `1209600000` for 14 days) |
| `water_cut` | `u64` | Yes | Micro-donation amount routed to clean water treasury (`0` if disabled) |
| `theme_id` | `u8` | Yes | Visual gift card theme identifier (`1`–`4`) |
| `clock` | `&Clock` | Yes | Sui framework Clock object (`0x6`) |
| `ctx` | `&mut TxContext` | Yes | Transaction context |

**Emits:** `EscrowCreated { escrow_id, sender, amount, water_donation, theme_id }`

---

#### `claim_escrow<T>`

Validates the Ed25519 signature over the recipient's address, transfers principal balance to recipient, routes clean water donation, and deletes the escrow object.

```move
public entry fun claim_escrow<T>(
    escrow: PaymentEscrow<T>,
    signature: vector<u8>,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext
)
```

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `escrow` | `PaymentEscrow<T>` | Yes | The shared payment escrow object |
| `signature` | `vector<u8>` | Yes | 64-byte Ed25519 signature of `bcs::to_bytes(&recipient)` |
| `recipient` | `address` | Yes | Beneficiary address (zkLogin derived or wallet) |
| `clock` | `&Clock` | Yes | Sui framework Clock object (`0x6`) |
| `ctx` | `&mut TxContext` | Yes | Transaction context |

**Emits:** `EscrowClaimed { escrow_id, recipient, amount, water_donation }`

---

#### `reclaim_escrow<T>`

Allows the original sender to cancel an unclaimed escrow and recover full funds once the expiration timestamp has passed.

```move
public entry fun reclaim_escrow<T>(
    escrow: PaymentEscrow<T>,
    clock: &Clock,
    ctx: &mut TxContext
)
```

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `escrow` | `PaymentEscrow<T>` | Yes | The expired payment escrow object |
| `clock` | `&Clock` | Yes | Sui framework Clock object (`0x6`) |
| `ctx` | `&mut TxContext` | Yes | Transaction context |

**Emits:** `EscrowReclaimed { escrow_id, sender, amount }`

---

### Cryptography Client SDK (`src/lib/crypto.ts`)

| Function | Parameters | Return Type | Description |
|----------|------------|-------------|-------------|
| `generateEphemeralKeypair()` | `none` | `EphemeralKeys` | Generates a fresh Ed25519 keypair in memory. Returns `privateKeyHex`, `publicKeyHex`, and `address`. |
| `buildClaimUrl()` | `baseUrl: string, escrowId: string, privateKeyHex: string` | `string` | Assembles the claim link placing the secret key strictly in the hash fragment (`#`). |
| `extractKeyFromFragment()` | `hash: string` | `string \| null` | Safely parses the private key from `window.location.hash` on the client side. |

---

## Configuration

### Environment Variables

Configure these keys in your `.env.local` file:

| Variable | Description | Required | Default / Example |
|----------|-------------|:--------:|-------------------|
| `NEXT_PUBLIC_APP_URL` | Base URL used when building shareable claim links | Yes | `https://floeonsui.vercel.app` |
| `NEXT_PUBLIC_SUI_NETWORK` | Target Sui network environment | Yes | `testnet` |
| `NEXT_PUBLIC_SUI_RPC_URL` | Sui JSON-RPC API endpoint | Yes | `https://fullnode.testnet.sui.io:443` |
| `NEXT_PUBLIC_FLOE_PACKAGE_ID` | Deployed Move package object ID | Yes | `0x...` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID for zkLogin | Yes | `xxx.apps.googleusercontent.com` |
| `NEXT_PUBLIC_ENOKI_API_KEY` | Public Enoki API key for gas sponsorship | Yes | `enoki_public_key_here` |
| `ENOKI_SECRET_KEY` | Private Enoki API key for backend relayer | No | `enoki_private_key_here` |
| `NEXT_PUBLIC_WATER_TREASURY_ADDRESS` | Lofi Clean Water on-chain treasury recipient | Yes | `0x10f1c1ea...` |

---

## Move Smart Contract Verification & Testing

To test and build the Move 2024 package locally:

```bash
# Navigate to the Move package directory
cd move

# Build package
sui move build

# Run unit tests
sui move test
```

---

## Troubleshooting

### Common Issues

#### 1. "Fragment missing or null" when opening claim link
- **Cause:** Some link shorteners or messaging apps drop URL hash fragments (`#...`) during HTTP 301/302 redirects.
- **Solution:** Send direct unshortened links (`https://floeonsui.vercel.app/claim?id=...#...`) or use the in-app QR code scanner.

#### 2. zkLogin "Redirect URI Mismatch" (Error 400)
- **Cause:** The current deployment domain is not registered in the Google Cloud Console Authorized JavaScript Origins.
- **Solution:** Add `https://floeonsui.vercel.app` and `http://localhost:3000` to **Authorized JavaScript origins** and **Authorized redirect URIs** in your Google Cloud Console OAuth 2.0 Client settings.

#### 3. Sponsored Gas "Insufficient Sponsor Balance"
- **Cause:** The Enoki sponsor gas pool is out of gas tokens on testnet.
- **Solution:** Fund your sponsor wallet via the Sui Testnet Discord faucet:
  ```bash
  curl -X POST https://faucet.testnet.sui.io/v1/gas -H "Content-Type: application/json" -d '{"FixedAmountRequest":{"recipient":"YOUR_ENOKI_SPONSOR_ADDRESS"}}'
  ```

#### 4. "EscrowNotExpired" during clawback
- **Cause:** Senders cannot claw back funds before the 14-day duration has elapsed.
- **Solution:** Check the countdown timer on the Sender Dashboard card. Funds unlock automatically once `Clock::timestamp_ms >= expires_at_ms`.

---

## Contributing

Contributions to Floe are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **[Sui Foundation & Mysten Labs](https://sui.io):** For zkLogin primitives, Move 2024, and the Enoki gas sponsorship infrastructure.
- **[Lofi The Yeti Hackathon](https://hackathon.lofitheyeti.com/):** For organizing CLAY Hackathon III and championing the Clean Water philanthropic mission.
- **[Lucide Icons](https://lucide.dev):** For accessible iconography.

---

Made with ❄️ for **Lofi The Yeti Hackathon (CLAY III)**
