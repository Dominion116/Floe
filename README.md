# Floe: send money with a link, on Sui

[![Live Demo](https://img.shields.io/badge/Live_Demo-floeonsui.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://floeonsui.vercel.app)
[![Sui Network](https://img.shields.io/badge/Blockchain-Sui_Network-4C72B0?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io)
[![Move 2024](https://img.shields.io/badge/Smart_Contract-Move_2024-22c55e?style=for-the-badge)](https://docs.sui.io/concepts/sui-move-concepts)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/Hackathon-Lofi_The_Yeti_CLAY_III-00B4D8?style=for-the-badge)](https://hackathon.lofitheyeti.com/)

> Send money with a link, with a yeti card, photo or voice note inside. Recipients tap "Continue with Google" and the money is theirs, with no wallet, seed phrase or gas.

**Live on Sui Testnet:** [floeonsui.vercel.app](https://floeonsui.vercel.app) · [Documentation](https://floeonsui.vercel.app/docs) · Package [`0xf11d…3663`](https://suiscan.xyz/testnet/object/0xf11d258ca429d592d4c22a538e50265c6804cd389716ff5570e2ada002013663)

> Hackathon software. The contract has unit tests but has not been audited.

---

## Features

- ✅ **Zero Seed Phrases (zkLogin):** Recipients authenticate via Google OAuth 2.0 without ever generating or securing a 12-to-24 word seed phrase.
- ✅ **Zero Gas to Claim:** Claims are sponsored through Enoki, with a Google login or a Sui wallet.
- ✅ **Trustless URL Fragment Cryptography:** Ephemeral Ed25519 private keys are stored strictly in the URL hash fragment (`#`), which Floe’s server never receives.
- ✅ **Lofi Clean Ocean Mission:** A 10¢ roundup the contract sends to the Lofi Foundation treasury when a link is claimed. Totals on the site are read from Sui.
- ✅ **Refunds:** Links expire after 14 days. The sender can refund an unclaimed link at any time, before or after that.
- ✅ **Consumer Currency Display:** Real-time dual display in fiat USD (`$10.00`) alongside `SUI`, and `$LOFI` on mainnet, at live prices.
- ✅ **Yeti Cards:** One-tap birthday, thank-you, congrats and holiday cards. Artwork source: `art/yeti-cards.html`.
- ✅ **Card, Photo & Voice Gifts on Walrus:** Encrypted in the browser with a key derived from the link, stored on Walrus, and opened after the claim.
- ✅ **Account & Withdraw:** Recipients see their balance and withdraw to any Sui address, with no seed phrase needed.
- ✅ **In-App Browser Help:** Detects browsers inside chat apps, where Google blocks login, and copies the whole link into a real one.
- ✅ **Social Share & QR Settlement:** One-tap link sharing for WhatsApp, Telegram, iMessage, and high-contrast dynamic QR codes for in-person payments.
- 💡 **Group Links (planned):** One link that several people can claim.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SENDER FLOW                                         │
│                                                                                        │
│  1. Sender picks an amount, note, optional gift and water roundup                      │
│  2. Client generates Ephemeral Keypair (ephem_sk, ephem_pk) in memory                   │
│  3. Sender signs PTB: Deposits Coin into shared PaymentEscrow locked to ephem_pk       │
│  4. Client encrypts the gift to Walrus, and builds /claim?id=<EscrowID>#k=…&n=…&g=…    │
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
│     - Signs the escrow ID and recipient address with ephem_sk                          │
│     - Destination set to derived zkLogin address                                       │
│     - Gas 100% sponsored by Enoki Gas Station                                          │
│  6. Contract verifies, pays the recipient and treasury, and deletes the escrow         │
│  7. Recipient opens the gift, then keeps, sends on or withdraws the money              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

Get the Floe web application up and running locally in three commands:

```bash
# 1. Clone repository
git clone https://github.com/Dominion116/Floe.git
cd Floe

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
   git clone https://github.com/Dominion116/Floe.git
   cd Floe
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

The transaction builders live in [`src/lib/chain/escrow.ts`](src/lib/chain/escrow.ts).

### 1. Creating a payment link

```typescript
import { buildClaimUrl, generateEphemeralKeypair } from "@/lib/crypto";
import { buildCreate, toUnits } from "@/lib/chain/escrow";
import { LINK_DURATION_MS } from "@/lib/chain/config";

const { privateKey, publicKeyHex } = generateEphemeralKeypair();

// Signed and paid for by the sender's wallet
const tx = buildCreate({
  token: "SUI",
  amountUnits: toUnits(10),
  waterUnits: toUnits(0.15),
  publicKeyHex,
  durationMs: LINK_DURATION_MS,
  themeId: "glacial",
});

// The key and the note stay in the fragment, which never reaches a server
const url = buildClaimUrl("https://floeonsui.vercel.app", escrowId, privateKey, "Thanks for lunch!");
```

### 2. Claiming

```typescript
import { parseClaimFragment } from "@/lib/crypto";
import { buildClaim } from "@/lib/chain/escrow";

const { privateKey } = parseClaimFragment(window.location.hash);

// Signs the escrow ID and recipient with the link's key, in the browser
const tx = await buildClaim(escrow, privateKey, recipient);
```

The recipient signs the transaction, then `POST /api/claim` checks that it is a single
`claim_escrow` call, simulates it, and asks Enoki to pay the gas.

### 3. Refunding

```typescript
import { buildReclaim } from "@/lib/chain/escrow";

// The sender can refund at any time until the link is claimed
const tx = buildReclaim(escrow);
```

---

## API Reference

### Move Smart Contract (`floe::escrow`)

The core escrow contract is implemented in Move 2024 at [`move/sources/escrow.move`](move/sources/escrow.move).

#### `create_escrow<T>`

Locks tokens into a shared escrow object authenticated by the ephemeral public key.

```move
public fun create_escrow<T>(
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
| `theme_id` | `u8` | Yes | Visual gift card theme identifier (`0`–`3`) |
| `clock` | `&Clock` | Yes | Sui framework Clock object (`0x6`) |
| `ctx` | `&mut TxContext` | Yes | Transaction context |

**Emits:** `EscrowCreated { escrow_id, sender, amount, water_donation, theme_id }`

---

#### `claim_escrow<T>`

Validates the Ed25519 signature over the escrow ID and recipient, transfers principal balance to recipient, routes clean water donation, and deletes the escrow object.

```move
public fun claim_escrow<T>(
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
| `signature` | `vector<u8>` | Yes | 64-byte Ed25519 signature of the escrow ID (32 bytes) followed by the recipient (32 bytes) |
| `recipient` | `address` | Yes | Beneficiary address (zkLogin derived or wallet) |
| `clock` | `&Clock` | Yes | Sui framework Clock object (`0x6`) |
| `ctx` | `&mut TxContext` | Yes | Transaction context |

**Emits:** `EscrowClaimed { escrow_id, recipient, amount, water_donation }`

---

#### `reclaim_escrow<T>`

Returns everything to the sender. Allowed at any time until the escrow is claimed, before or after it expires.

```move
public fun reclaim_escrow<T>(
    escrow: PaymentEscrow<T>,
    ctx: &mut TxContext
)
```

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `escrow` | `PaymentEscrow<T>` | Yes | The unclaimed payment escrow object |
| `ctx` | `&mut TxContext` | Yes | Transaction context |

**Emits:** `EscrowReclaimed { escrow_id, sender, amount }`

---

### Cryptography Client SDK (`src/lib/crypto.ts`)

| Function | Parameters | Return Type | Description |
|----------|------------|-------------|-------------|
| `generateEphemeralKeypair()` | `none` | `EphemeralKeys` | Generates a fresh Ed25519 keypair in memory. Returns `privateKey` and `publicKeyHex`. |
| `buildClaimUrl()` | `baseUrl, escrowId, privateKey, note?, giftId?` | `string` | Builds the claim link with the key, note and gift ID strictly in the hash fragment (`#`). |
| `parseClaimFragment()` | `hash: string` | `{ privateKey, note, giftId }` | Reads the key, note and gift ID from `window.location.hash` in the browser. |

---

## Configuration

### Environment Variables

Configure these keys in your `.env.local` file:

| Variable | Description | Required | Default / Example |
|----------|-------------|:--------:|-------------------|
| `NEXT_PUBLIC_APP_URL` | Site address for link previews, `robots.txt` and the sitemap | No | `https://floeonsui.vercel.app` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Monitored contact address, shown publicly | No | Falls back to GitHub issues |
| `NEXT_PUBLIC_SUI_NETWORK` | Target Sui network environment | Yes | `testnet` |
| `NEXT_PUBLIC_SUI_RPC_URL` | Sui gRPC endpoint | No | `https://fullnode.testnet.sui.io:443` |
| `NEXT_PUBLIC_FLOE_PACKAGE_ID` | Deployed Move package object ID | Yes | `0x...` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID for zkLogin | Yes | `xxx.apps.googleusercontent.com` |
| `NEXT_PUBLIC_ENOKI_API_KEY` | Public Enoki API key for gas sponsorship | Yes | `enoki_public_key_here` |
| `NEXT_PUBLIC_WALRUS_PUBLISHER` | Walrus publishers for gifts, comma separated | No | Public services on testnet, off on mainnet |
| `NEXT_PUBLIC_WALRUS_AGGREGATOR` | Walrus aggregators for gifts, comma separated | No | Public service on testnet, off on mainnet |
| `ENOKI_SECRET_KEY` | Private Enoki API key, used by `/api/claim` to pay gas | Yes | `enoki_private_key_here` |

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

### Deploying to testnet

```bash
cd move
sui client switch --env testnet
sui client publish
```

Fund the account at [faucet.sui.io](https://faucet.sui.io) first. Copy the published package ID into `NEXT_PUBLIC_FLOE_PACKAGE_ID`. Then, in the
[Enoki Portal](https://enoki.mystenlabs.com):

1. Add your Google OAuth client ID.
2. Create a public key with zkLogin enabled and a private key with sponsored transactions enabled, both for testnet.
3. Allow the Move call target `<package id>::escrow::claim_escrow`.

In Google Cloud Console, add `http://localhost:3000/auth` and `https://<your domain>/auth` as
authorized redirect URIs.

---

## Troubleshooting

### Common Issues

#### 1. "Fragment missing or null" when opening claim link
- **Cause:** Some link shorteners or messaging apps drop URL hash fragments (`#...`) during HTTP 301/302 redirects.
- **Solution:** Send direct unshortened links (`https://floeonsui.vercel.app/claim?id=...#...`) or scan the QR code with a phone camera.

#### 2. zkLogin "Redirect URI Mismatch" (Error 400)
- **Cause:** This site's `/auth` page is not registered as a redirect URI in Google Cloud Console.
- **Solution:** Add `https://floeonsui.vercel.app/auth` and `http://localhost:3000/auth` to **Authorized redirect URIs** in your Google Cloud Console OAuth 2.0 Client settings.

#### 3. Sponsored Gas "Insufficient Sponsor Balance"
- **Cause:** The Enoki sponsor gas pool is out of gas tokens on testnet.
- **Solution:** Check the gas budget for testnet in the [Enoki Portal](https://enoki.mystenlabs.com). Claims fail safely, so the money stays in its escrow.

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
