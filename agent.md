# Agent Instructions — Floe

You are building **Floe**, a consumer-grade crypto payment link app on the Sui Network. Read this file in full before writing a single line of code.

---

## 1. What You Are Building

Floe lets a sender generate a shareable payment link in 5 seconds. The recipient — who has never heard of crypto — clicks it, taps "Continue with Google", and the money lands in their account in under 2 seconds with zero gas fees and zero wallet setup.

The product is live on testnet and has these surfaces:

| Surface | Description |
|---|---|
| **Landing Page** | Public marketing page. Hero, 3-step explainer, interactive demo, FAQ. |
| **Sender Experience** | Keypad → amount → theme → note → share modal with QR + deep links. |
| **Recipient Claim** | Envelope → Google login or Sui wallet → confetti → gift reveal → account. |
| **Account** | Balance, address and withdrawals at `/account`. |
| **Docs and legal** | `/docs`, `/privacy` and `/terms`, from `src/content`. |
| **Sender Dashboard** | History feed of links with Pending / Claimed / Expired status + clawback. |

Build in that order. Do not skip ahead to smart contract wiring until all four UI surfaces are complete and visually polished.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Package manager:** `npm` only — never use pnpm, yarn, or bun
- **Fonts:** Newsreader 300 (editorial serif) · Geist · Geist Mono

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#121111` | Primary text, dark backgrounds |
| `--color-mist` | `#CCD3CD` | Subtle surface tint, borders |
| `--color-frost` | `#C3CEEF` | Accent, interactive highlights |
| `--color-white` | `#FFFFFF` | Base background |
| `--color-snow` | `#F9F9F9` | Section alternating background |

### Typography Scale

- Display / Hero: Newsreader 300, large, slight tracking
- UI labels & body: Geist
- Code snippets / addresses: Geist Mono

---

## 3. Architecture — How the Escrow Works

```
SENDER
  1. Selects amount ($10 / SUI / $LOFI) + note + optional water roundup
  2. Client generates ephemeral keypair (ephem_sk, ephem_pk) in memory
  3. Signs PTB: deposits Coin into PaymentEscrow locked to ephem_pk
  4. Builds link: https://floeonsui.vercel.app/claim?id=<EscrowID>#k=<ephem_sk>&n=<note>&g=<gift blob ID>
  5. Shares via WhatsApp / iMessage / QR

RECIPIENT
  1. Opens link in mobile browser
  2. Client extracts EscrowID from ?id= and ephem_sk from window.location.hash
  3. Clicks "Continue with Google" → zkLogin OAuth
  4. App derives deterministic Sui zkLogin address
  5. ephem_sk signs escrow ID + recipient; the Claim PTB is sponsored by Enoki
  6. Consensus settles in ~400 ms → funds transferred
  7. Unboxing animation fires
```

**Key security property:** `ephem_sk` lives only in the URL hash fragment. It is never sent to any server. The platform never holds decryption keys.

---

## 4. Smart Contract Reference (`floe::escrow`)

The Move 2024 module lives at `move/sources/escrow.move`.

**Struct:**
```move
public struct PaymentEscrow<phantom T> has key {
    id: UID,
    balance: Balance<T>,
    sender: address,
    ephemeral_pubkey: vector<u8>,  // Ed25519 public key
    expires_at_ms: u64,            // default: now + 14 days
    water_donation: Balance<T>,
    theme_id: u8,
}
```

**Entry functions:**
- `create_escrow<T>` — splits coin, shares the escrow object, emits `EscrowCreated`
- `claim_escrow<T>` — verifies ephem signature, transfers funds, routes water donation, emits `EscrowClaimed`
- `reclaim_escrow<T>` — sender refund at any time until claimed, emits `EscrowReclaimed`

---

## 5. Implementation Order (Strict)

Follow this sequence. Do not begin a phase until the previous one is visually complete.

```
Phase 1  │ Landing Page (Hero · 3-step · live demo · FAQ)
Phase 2  │ Sender Experience (keypad · themes · share modal · QR)
Phase 3  │ Recipient Claim (envelope reveal · auth states · unboxing)
Phase 4  │ Sender Dashboard (link feed · status pills · clawback)
Phase 5  │ Move contracts + local test suite
Phase 6  │ zkLogin + ephemeral key + Enoki gas sponsorship
Phase 7  │ Testnet deploy + video + submission package
```

---

## 6. Hard Rules — Read Before Every Task

### ❌ Never do this
- **Do not run `npm run build` or `npm run lint` locally.** Ever. Do not suggest it, do not add it to any script, do not check for build errors by running a build.
- Do not use pnpm, yarn, or bun for any installation command.
- Do not store `ephem_sk` anywhere except the URL hash fragment (`window.location.hash`).
- Do not use placeholder images or Lorem Ipsum — write real copy aligned to the PRD.
- Do not add an announcement bar.
- Do not use dividers between every section — use them sparingly.
- Do not use inline color values — always reference the CSS custom properties defined in the palette above.

### ✅ Always do this
- Install dependencies with `npm install <package>`.
- Keep navbar and hero on the same background.
- Apply scroll-triggered animations (Framer Motion `useInView` / `whileInView`) to every section.
- Display amounts in fiat (`$10.00`) by default; SUI / $LOFI are toggle options.
- Keep all text concise — no wall-of-text sections.
- Write mobile-first responsive CSS; the primary target device is iOS Safari inside WhatsApp/Telegram.

---

## 7. Copy & Messaging

- **Hero headline:** *"Send money with a link. No wallet needed."*
- **Sub-headline:** *"They click, log in with Google, and the money is theirs. No app. No seed phrase. No gas."*
- **CTA:** *"Create a payment link"*
- **Step 1:** Create — Pick an amount and get a private link.
- **Step 2:** Share — Send it on WhatsApp, Telegram, or iMessage.
- **Step 3:** Claim — Your friend logs in with Google, and opens what you put inside.
- **Water roundup toggle:** *"💧 Round up to donate 10¢ to clean ocean water"*
- **Claim progress states:** *Authenticating… → Verifying… → Claiming…*

---

## 8. Success Bar for Hackathon Judging

Before considering any surface "done", verify these:

1. A non-crypto user can claim funds in under 3 clicks and 5 seconds.
2. Zero gas required from the recipient — 100% sponsored.
3. Feels like a native app when opened inside WhatsApp on iPhone.
4. The 10¢ water donation is visibly demonstrated on-chain.
