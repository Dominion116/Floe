# Project: Floe — 2-Second Crypto Payment Links on Sui

> **Original brief.** Kept for history. Where it differs from the code, the code and [the docs](https://floeonsui.vercel.app/docs) are right.

Act as a senior full-stack developer, UI/UX designer, and Web3 product strategist. Build **Floe**, a consumer-grade payment link application powered by the Sui Network. Floe lets a sender generate a shareable payment link in seconds. The recipient — who has never touched crypto — clicks the link, taps "Continue with Google", and the money lands in their account in under 2 seconds with zero gas fees and zero wallet setup required.

The product is built for the Lofi the Yeti hackathon and must be polished enough to demo live to judges on day one.

---

## 1. Main Concept

A sender picks an amount, optionally adds a gift note and a 10¢ clean-water micro-donation, and receives a shareable URL. That URL contains a cryptographic ephemeral private key in the hash fragment — meaning it never touches any server. The recipient opens the link, authenticates with Google via zkLogin, and an Enoki-sponsored transaction atomically releases the funds from a Move escrow object to their brand-new Sui address. No seed phrase. No gas. No app install.

Build for two primary actors:
- **Sender** — creates payment links, manages their history, reclaims unclaimed funds.
- **Recipient** — receives a link, claims funds with a single Google sign-in tap.

---

## 2. Design System

Create a premium, modern, responsive interface. The reference aesthetic is clean editorial — think editorial print meets fintech minimalism.

**Design requirements:**
- Minimalist and elegant layout. No clutter.
- Generous whitespace and deliberate section rhythm.
- Smooth scroll-triggered animations on every section (Framer Motion `whileInView`).
- Mobile-first responsive design — primary target is iOS Safari inside WhatsApp and Telegram.
- No announcement bar.
- Use dividers sparingly — not between every section.
- Navbar and hero share the same background.
- Never use inline color values — always use CSS custom properties.

**Color palette:**

| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#121111` | Primary text, dark surfaces |
| `--color-mist` | `#CCD3CD` | Borders, subtle tints |
| `--color-frost` | `#C3CEEF` | Accent, interactive highlights |
| `--color-white` | `#FFFFFF` | Base background |
| `--color-snow` | `#F9F9F9` | Alternating section backgrounds |

**Typography:**
- Display / Hero: **Newsreader 300** (editorial serif, large scale, slight tracking)
- UI labels, body, buttons: **Geist**
- Addresses, code snippets: **Geist Mono**

---

## 3. Public Landing Page

The landing page is the top-of-funnel. It must educate a non-crypto user in 10 seconds and let them try the product before creating an account.

**Hero section:**
- Headline: *"Send money with a link. No wallet needed."*
- Sub-headline: *"They click, log in with Google, and the money is theirs. No app. No seed phrase. No gas."*
- Primary CTA: "Create a payment link"
- Secondary CTA: "See how it works"
- Animated mockup showing a phone receiving a payment link and the unboxing moment.

**3-step explainer:**
1. **Create** — Pick an amount and get a private link.
2. **Share** — Send it on WhatsApp, Telegram, or iMessage.
3. **Claim** — Your friend logs in with Google or Apple. Done.

**Interactive live demo:**
- An embedded "Claim \$5" demo card that any visitor can click through to experience the recipient unboxing animation without spending real tokens.

**Lofi Mission ticker:**
- Real-time (or mocked) counter of gallons of clean water funded through platform 10¢ micro-roundups.

**FAQ section:**
- Plain-English answers covering: Is this safe? What if the link expires? Which tokens are supported? Who pays the gas fees?

**Final CTA section:**
- Bright closing block with the primary CTA repeated.

---

## 4. Sender Experience (Transfer Creator)

**Step 1 — Amount:**
- Clean numeric keypad UI.
- Default display: fiat denomination (`$`).
- Toggle to native token: `SUI` or `$LOFI`.
- Quick-select amounts: \$5, \$20, \$50.

**Step 2 — Personalize:**
- Select a gift card theme: Yeti Glacial · Coffee Chill · Birthday Pop · Clean Water Blue.
- Add a personal note (e.g., *"Thanks for lunch!"*).
- Toggle: *"💧 Round up to donate 10¢ to clean ocean water"* — with real-time impact calculation.

**Step 3 — Share:**
- Displays generated payment link.
- One-tap Copy button.
- Direct deep-link share buttons: WhatsApp, Telegram, iMessage, Twitter DM.
- Downloadable high-contrast QR code for in-person settlement.

---

## 5. Recipient Experience (One-Click Claim)

**Envelope presentation:**
- Full-screen animated 3D/CSS gift card reveal showing: Sender Name, Gift Note, Amount, and selected Theme.

**Authentication:**
- Prominent primary button: *"Continue with Google"* (zkLogin).
- Secondary button: *"Continue with Apple"* (zkLogin).
- Subtle fallback for Web3 natives: *"Connect Sui Wallet"*.

**Claim progress:**
- Inline status indicator: *Authenticating… → Verifying… → Claiming…* (target: under 2 seconds total).
- On success: haptic vibration trigger + confetti animation + Yeti unboxing reveal.

**Post-claim:**
- Immediate balance view.
- Action buttons: *"Send to Friend"* · *"Keep in Account"* · *"Export / Withdraw"*.

---

## 6. Sender Management Dashboard

**Active links feed:**
- Cards for every link the sender has created, each showing:
  - Amount and recipient note.
  - Status pill: `Pending` · `Claimed` · `Expired / Reclaimed`.
  - For `Pending`: creation date and time remaining before expiry (default: 14 days).
  - For `Claimed`: exact claim timestamp and masked recipient identity.

**Clawback:**
- For any `Pending` link: *"Cancel & Refund"* button — triggers an atomic PTB that destroys the escrow and returns coins to the sender's wallet.

**Link persistence:**
- Store link history locally in IndexedDB and query live status from on-chain escrow objects.

---

## 7. Architecture — Escrow Protocol

```
SENDER FLOW
  1. Selects amount (SUI / $LOFI) + note + optional water roundup
  2. Client generates ephemeral keypair (ephem_sk, ephem_pk) in-memory
  3. Signs PTB: deposits Coin into PaymentEscrow locked to ephem_pk
  4. Builds URL: https://floe.app/claim?id=<EscrowID>#<ephem_sk>
  5. Shares via WhatsApp / iMessage / QR

RECIPIENT FLOW
  1. Opens link in mobile browser
  2. Client extracts EscrowID from ?id= and ephem_sk from window.location.hash
  3. Clicks "Continue with Google" → zkLogin OAuth
  4. App derives deterministic Sui zkLogin address
  5. Builds Claim PTB signed by ephem_sk; gas 100% sponsored by Enoki
  6. Consensus settles in ~400 ms → funds transferred to recipient
  7. Unboxing animation fires
```

**Non-custodial guarantee:** `ephem_sk` lives only in the URL hash fragment. It is never sent to any server, never stored in a database, never logged.

**Expiry & clawback:** Every escrow contains a sender clawback timestamp (default 14 days). After expiry, `reclaim_escrow` returns all funds to the sender.

---

## 8. Smart Contract Specification (Move 2024)

Module: `floe::escrow` at `move/sources/escrow.move`.

**Core struct:**
```move
public struct PaymentEscrow<phantom T> has key, store {
    id: UID,
    balance: Balance<T>,
    sender: address,
    ephemeral_pubkey: vector<u8>,  // Ed25519 public key
    expires_at_ms: u64,
    water_donation: Balance<T>,
    theme_id: u8,
}
```

**Events:** `EscrowCreated` · `EscrowClaimed` · `EscrowReclaimed`

**Entry functions:**
1. `create_escrow<T>` — splits coin into principal + water donation, shares escrow object.
2. `claim_escrow<T>` — verifies ephem signature, transfers balance to recipient, routes water donation to Lofi Foundation treasury, deletes escrow.
3. `reclaim_escrow<T>` — sender clawback after expiry, returns all balances, deletes escrow.

---

## 9. Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Blockchain | Sui Network (Devnet → Testnet → Mainnet) |
| Smart contracts | Move 2024 |
| Auth | Sui zkLogin (Google OAuth 2.0 + Apple) |
| Gas sponsorship | Enoki / Shinami sponsored transactions |
| Crypto primitives | `@mysten/sui` SDK, Ed25519 ephemeral keypair |
| QR codes | `qrcode` or `react-qr-code` |
| Local persistence | IndexedDB (link history) |
| Package manager | **npm only** — never pnpm, yarn, or bun |
| Fonts | Newsreader · Geist · Geist Mono |
| Deployment | Vercel (HTTPS required) |

---

## 10. Pages to Build

| # | Route | Description |
|---|---|---|
| 1 | `/` | Public landing page |
| 2 | `/send` | Sender experience — keypad, theme, share modal |
| 3 | `/claim` | Recipient claim page — envelope reveal, auth, unboxing |
| 4 | `/dashboard` | Sender management dashboard — link feed, clawback |
| 5 | `/dashboard/analytics` | Per-link view counts, claim rates, water impact |

---

## 11. Implementation Order (Strict — UI First)

Build in this exact sequence. Do not begin a phase until the previous phase is visually complete and reviewed.

```
Phase 1  │ Landing Page (Hero · 3-step explainer · live demo · FAQ · closing CTA)
Phase 2  │ Sender Experience (/send — keypad · themes · note · share modal · QR)
Phase 3  │ Recipient Claim (/claim — envelope reveal · auth states · unboxing · post-claim)
Phase 4  │ Sender Dashboard (/dashboard — link feed · status pills · clawback)
Phase 5  │ Move 2024 smart contracts + unit tests (localnet)
Phase 6  │ zkLogin integration + ephemeral key generation + Enoki gas sponsorship
Phase 7  │ Testnet deployment + end-to-end testing + video + hackathon submission
```

---

## 12. Development Constraints — Non-Negotiable

### ❌ Never do this
- **Do not run `npm run build` or `npm run lint` locally. Not once.**
- Do not use pnpm, yarn, or bun.
- Do not store `ephem_sk` anywhere except `window.location.hash`.
- Do not log, transmit, or persist `ephem_sk` to any server or database.
- Do not use Lorem Ipsum or placeholder copy — write real product copy from the specs above.
- Do not add an announcement bar.
- Do not add a divider between every section.
- Do not hardcode color hex values in components — always use CSS custom properties.
- Do not simulate a successful claim, auth, or transaction — use real SDK calls.
- Do not expose API keys or secrets in frontend code.

### ✅ Always do this
- Install dependencies with `npm install <package>`.
- Apply scroll-triggered animations (`whileInView`) to every content section.
- Keep navbar and hero on the same background.
- Display amounts in fiat (`$10.00`) by default; SUI / $LOFI are toggle options.
- Keep all text concise — no wall-of-text sections.
- Write mobile-first responsive CSS; primary target is iOS Safari inside WhatsApp/Telegram.
- Use reusable components and clean file organization.
- Provide `.env.example` with every required environment variable documented.
- Include realistic loading states, empty states, and error handling.

---

## 13. Copy Reference

| Element | Copy |
|---|---|
| Hero headline | *"Send money with a link. No wallet needed."* |
| Hero sub-headline | *"They click, log in with Google, and the money is theirs. No app. No seed phrase. No gas."* |
| Primary CTA | "Create a payment link" |
| Step 1 | Create — Pick an amount and get a private link. |
| Step 2 | Share — Send it on WhatsApp, Telegram, or iMessage. |
| Step 3 | Claim — Your friend logs in with Google or Apple. Done. |
| Water toggle | "💧 Round up to donate 10¢ to clean ocean water" |
| Claim progress | *Authenticating… → Verifying… → Claiming…* |
| Clawback CTA | "Cancel & Refund" |

---

## 14. Execution Plan

First, scaffold the Next.js project with TypeScript, Tailwind, and Framer Motion using **npm**. Define the component architecture and CSS custom property tokens. Then build Phase 1 (landing page) in full before moving to Phase 2.

Prioritize a working, visually complete UI that judges can interact with on day one. Smart contract wiring (Phases 5–6) follows only after all four UI surfaces are polished.

Make reasonable product decisions without waiting for clarification. Deliver clean, production-minded code. Explain how to run the project locally.

**Start building now.**
