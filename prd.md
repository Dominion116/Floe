# Product Requirements Document (PRD)
## Floe — The 2-Second Payment Link on Sui (One-Click Payment Links)

---

## 1. Executive Summary & Product Vision

### 1.1 The Problem
Sending crypto to a non-crypto native today is fundamentally broken. To receive \$10:
1. The recipient must research and download a non-custodial wallet browser extension or mobile app.
2. They must write down and secure a 12-to-24 word seed phrase.
3. They must copy-paste an intimidating 66-character hexadecimal address (`0x7a8b...3f9c`).
4. The sender must wait for confirmation, while the recipient has no SUI tokens to pay gas fees if they ever want to move the funds.
This process experiences an estimated **95%+ drop-off rate** for mainstream consumers.

### 1.2 The Solution
A web-first, consumer-grade payment application that operates identically to Cash App, Venmo, or Apple Cash, powered invisibly by the Sui Network:
* **Senders** generate an encrypted payment link in 5 seconds with custom gift notes and an optional clean-water micro-donation toggle.
* **Recipients** click a link received via WhatsApp, iMessage, or Telegram, tap "Continue with Google" or "Continue with Apple", and within 1.5 seconds, the money is secured in their account with **zero gas fees paid** and **zero wallet setup**.

### 1.3 Key Value Proposition
* **Zero Jargon:** Interface displays dollars (`$10.00`) by default with live SUI / $LOFI exchange toggles.
* **Zero Gas for Receivers:** Transactions are 100% sponsored via Sui Gas Station / Enoki.
* **Non-Custodial & Trustless:** The platform never holds the decryption keys. Funds sit in on-chain escrows unlocked only by the recipient's authenticated signature via zkLogin and client-side URL fragment cryptography.
* **Lofi Mission Integration:** Built-in "Round up 10¢ to Clean Water" feature directly routing micro-donations to the host's environmental initiative.

---

## 2. Brand Identity & Name

**Floe** — single syllable, 4 letters. Phonetically identical to "Flow". Directly references the Arctic/Yeti hackathon environment while symbolizing frictionless cash flow and the ocean cleanup mission.

Naming constraints: no compound words, no crypto jargon, short single-word phonetics.

---

## 3. High-Level Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SENDER FLOW                                         │
│                                                                                        │
│  1. Sender selects $10 (SUI / $LOFI) + custom note + water roundup                     │
│  2. Client generates Ephemeral Keypair (ephem_sk, ephem_pk) in memory                   │
│  3. Sender signs PTB: Deposits Coin into EscrowObject locked to ephem_pk               │
│  4. Client constructs Link: https://floe.app/claim?id=<EscrowID>#<ephem_sk>            │
│  5. Sender shares via WhatsApp / iMessage / QR                                         │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                                         ▼ Link Shared (URL hash # never touches server)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RECIPIENT FLOW                                       │
│                                                                                        │
│  1. Recipient opens link in mobile browser                                             │
│  2. Client extracts EscrowID from query params and ephem_sk from window.location.hash   │
│  3. Recipient clicks "Continue with Google" (zkLogin OAuth)                            │
│  4. App derives Recipient's deterministic Sui zkLogin address                          │
│  5. Client constructs Claim PTB:                                                       │
│     - Authenticated by ephem_sk signature                                              │
│     - Recipient address set as destination                                             │
│     - Gas sponsored 100% by Gas Station (Enoki / Sponsored Transaction)                │
│  6. Consensus executes in ~400ms: Escrow balance transferred to Recipient              │
│  7. Unboxing animation triggers: Funds immediately available                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Trustless Non-Custodial Cryptography
* **Zero Server Storage of Secrets:** The private key `ephem_sk` is stored exclusively in the URL **hash fragment** (after `#`). Standard HTTP protocols dictate that hash fragments are parsed client-side and never transmitted in HTTP request headers to web servers or analytics CDNs.
* **Sender Reclamation / Safety Timeouts:** Every escrow object contains a configurable sender clawback timestamp (default: 14 days). If an un-claimed link is sent to the wrong phone number or ignored, the sender can hit "Cancel & Reclaim" in their dashboard to return the funds to their wallet.

---

## 4. Product Functional Requirements

### 4.1 Surface 1: High-Converting Public Landing Page
The landing page must establish immediate consumer trust, educate users in 10 seconds, and offer an interactive sandbox before asking for wallet connection:
* **Hero Section:**
  * Punchy headline: *"Send money with a link. No wallet needed."*
  * Interactive Live Simulator widget: Senders can toggle amounts ($5, $20, $50), select custom greeting cards (Birthday, Coffee, Yeti Blue), and preview the generated link in real time.
* **3-Step Visual Explainer:**
  1. *Create:* Pick an amount and get a private link.
  2. *Share:* Send it on WhatsApp, Telegram, or iMessage.
  3. *Claim:* Your friend logs in with Google or Apple. Done.
* **The "Lofi Mission" Banner:** Real-time counter of gallons of clean water funded through platform micro-roundups.
* **Interactive Live Claim Demo:** A mock "Claim $5" test card allowing judges/visitors to click and experience the receiver unboxing animation without spending actual tokens.
* **FAQ:** Plain-English answers addressing security, lost links, supported tokens, and fees.

### 4.2 Surface 2: Sender Experience (Transfer Creator)
* **Numeric Keypad UI:** Clean, minimalist keypad prioritizing fiat denomination (`$`) with toggle to native token (`SUI`, `$LOFI`).
* **Theme & Personalization:** Custom visual card backgrounds (Yeti Glacial, Coffee Chill, Birthday Pop, Clean Water Blue) and personal note input (`"Thanks for lunch!"`).
* **Clean Water Micro-Roundup:** A subtle switch: *"💧 Round up to donate 10¢ to clean ocean water"*.
* **Share Modal:**
  * Clean shortened URL with one-tap Copy button.
  * Direct deep-link share buttons for WhatsApp, Telegram, iMessage, and Twitter DM.
  * Scannable high-contrast QR code for in-person settlement.

### 4.3 Surface 3: Recipient Experience (One-Click Claim)
* **Envelope Presentation:** Animated 3D/CSS card displaying Sender Name, Note, Amount, and Theme.
* **Single-Action Authentication:** Prominent primary buttons:
  * *"Continue with Google"* (zkLogin)
  * *"Continue with Apple"* (zkLogin)
  * *(Subtle fallback for Web3 natives: "Connect Sui Wallet")*
* **Zero-Friction Claim State:**
  * Progress indicator: *Authenticating... Verifying... Claiming...* (< 2 seconds total).
  * Haptic vibration and confetti / Yeti unboxing animation on success.
* **Post-Claim Dashboard:**
  * Immediate balance view.
  * Action buttons: *"Send to Friend"*, *"Keep in Account"*, or *"Export / Withdraw"*.

### 4.4 Surface 4: Sender Management & History Dashboard
* **Active Links Feed:** Cards showing all created links categorized by status:
  * `Pending` (unclaimed, shows creation date & time remaining).
  * `Claimed` (shows exact timestamp and recipient masked identity).
  * `Expired / Reclaimed`.
* **One-Click Clawback:** For any pending link, an immediate "Cancel & Refund" action triggering an atomic PTB that destroys the escrow and returns coins to the sender.

---

## 5. Move 2024 Smart Contract Specification

### 5.1 Core Move Structs
```move
module floe::escrow {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Clock};
    use sui::event;

    /// Error codes
    const EInvalidSignature: u64 = 0;
    const EEscrowExpired: u64 = 1;
    const EEscrowNotExpired: u64 = 2;
    const EUnauthorized: u64 = 3;

    /// The Shared Escrow Object holding the deposited funds
    public struct PaymentEscrow<phantom T> has key, store {
        id: UID,
        balance: Balance<T>,
        sender: address,
        ephemeral_pubkey: vector<u8>, // Ed25519 public key
        expires_at_ms: u64,
        water_donation: Balance<T>,
        theme_id: u8,
    }

    /// Events
    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        sender: address,
        amount: u64,
        water_donation: u64,
    }

    public struct EscrowClaimed has copy, drop {
        escrow_id: ID,
        recipient: address,
        amount: u64,
    }

    public struct EscrowReclaimed has copy, drop {
        escrow_id: ID,
        sender: address,
        amount: u64,
    }
}
```

### 5.2 Core Entry Functions
1. `create_escrow<T>(coin: Coin<T>, ephem_pubkey: vector<u8>, duration_ms: u64, water_cut: u64, theme_id: u8, ctx: &mut TxContext)`:
   * Splits coin into principal balance and optional water donation balance.
   * Emits `EscrowCreated` and shares the `PaymentEscrow<T>` object.
2. `claim_escrow<T>(escrow: PaymentEscrow<T>, signature: vector<u8>, recipient: address, clock: &Clock, ctx: &mut TxContext)`:
   * Verifies that `signature` over `recipient` address matches `escrow.ephemeral_pubkey`.
   * Transfers `balance` to `recipient`.
   * Automatically routes `water_donation` to the verified Lofi Foundation Clean Water treasury address.
   * Deletes the escrow object and emits `EscrowClaimed`.
3. `reclaim_escrow<T>(escrow: PaymentEscrow<T>, clock: &Clock, ctx: &mut TxContext)`:
   * Asserts `tx_context::sender(ctx) == escrow.sender`.
   * Asserts `clock::timestamp_ms(clock) >= escrow.expires_at_ms`.
   * Returns all balances to `escrow.sender` and deletes escrow object.

---

## 6. Implementation Roadmap: Strict UI-First Strategy

To guarantee a world-class user experience and satisfy the hackathon requirement of having a polished, functional, visual product ready for judging, all user-facing design and frontend workflows are built and verified before integrating backend consensus.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    PHASED IMPLEMENTATION TIMELINE                          │
├────────────────────────────────────────────────────────────────────────────┤
│ [Phase 1] Brand, Design System & Public Landing Page (Days 1–3)            │
│ [Phase 2] Sender Experience UI & Link Generator (Days 4–6)                 │
│ [Phase 3] Recipient Claim UI & Unboxing Experience (Days 7–9)              │
│ [Phase 4] Sender Management & History Dashboard UI (Days 10–11)            │
│ [Phase 5] Move 2024 Smart Contract & Escrow Engine (Days 12–15)            │
│ [Phase 6] zkLogin, Ephemeral Key & Gas Station Integration (Days 16–20)    │
│ [Phase 7] Testnet Verification, Video & Hackathon Submission (Days 21–24)  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Brand System & Public Landing Page
* Establish visual guidelines: fonts, ice/water color palette, micro-interactions, responsive mobile container.
* Build responsive Landing Page with Hero, Live Interactive Simulator widget, "How it Works" interactive cards, Lofi Clean Water impact ticker, and FAQ accordion.
* Implement Mock Interactive Claim Demo on the landing page so any visitor can test the receiver experience immediately.

### Phase 2: Sender Experience UI & Link Generation
* Build numeric keypad with fiat USD parity toggles.
* Build card customization tray (selectable greeting cards, notes).
* Implement Lofi Clean Water round-up toggle with real-time impact calculation.
* Build share dialogue with dynamic QR code rendering and deep links (WhatsApp, iMessage, Telegram).

### Phase 3: Recipient Claim UI & Unboxing Experience
* Build mobile-optimized gift envelope reveal screen.
* Create fluid CSS/Lottie unboxing animation (Yeti breaking ice / opening gift package).
* Design zero-jargon authentication states: "Sign in with Google", "Sign in with Apple".
* Build recipient balance summary view and follow-up action buttons.

### Phase 4: Sender Management & History Dashboard
* Build dashboard tracking all user-issued links stored locally (IndexedDB) and queried on-chain.
* Display real-time status pills: `Pending`, `Claimed`, `Expired`.
* Build countdown timer and "Cancel & Refund" action button with confirmation sheet.

### Phase 5: Move 2024 Smart Contracts & Local Test Suite
* Implement `floe::escrow` Move 2024 package with dynamic capability checks and Hot Potato-style security.
* Write comprehensive Move unit tests covering signature verification, double-claim prevention, expiration assertions, and water-donation routing.
* Deploy package to Sui Localnet / Devnet and record Package ID.

### Phase 6: zkLogin, Ephemeral Crypto & Sponsored Gas Station
* Implement client-side Ed25519 ephemeral keypair generation and URL fragment encoding.
* Integrate Sui zkLogin SDK with Google OAuth 2.0 Client ID.
* Configure Enoki / Shinami / custom Gas Station sponsored transaction pool to cover gas fees for recipients.
* Connect frontend PTB builders with live smart contract endpoints.

### Phase 7: Testnet Deployment, Polish & Submission Package
* Deploy verified Move package to Sui Testnet.
* Conduct end-to-end user testing across iOS Safari, Android Chrome, and Telegram in-app browsers.
* Record high-tempo, 2-minute product walkthrough video featuring a live phone-to-phone transfer.
* Prepare open-source GitHub repository with clean documentation, architecture diagrams, and deployed Package ID.

---

## 7. Development Constraints

* **Package Manager:** All dependencies must be installed with **npm**. Do not use pnpm, yarn, or bun.

---

## 8. Success Metrics for Hackathon Judging

1. **Zero-Drop Onboarding:** A judge or non-crypto user can successfully claim funds into a new Sui account in under **3 clicks** and less than **5 seconds**.
2. **Zero Gas Friction:** 100% of recipient claim transactions execute without requiring the recipient to hold SUI.
3. **Flawless Mobile Responsive UX:** Native app feel when opened inside WhatsApp, Telegram, or Safari.
4. **Verifiable Impact:** Every claim visibly demonstrates the Lofi Clean Water philanthropic contribution on-chain.
