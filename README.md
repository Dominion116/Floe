# Floe — The 2-Second Payment Link on Sui

[![Live Demo](https://img.shields.io/badge/Live_Demo-floeonsui.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://floeonsui.vercel.app)
[![Sui Network](https://img.shields.io/badge/Blockchain-Sui_Network-4C72B0?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io)
[![Hackathon](https://img.shields.io/badge/Hackathon-Lofi_The_Yeti_CLAY_III-00B4D8?style=for-the-badge)](https://hackathon.lofitheyeti.com/)

**Live URL:** [https://floeonsui.vercel.app](https://floeonsui.vercel.app)

Floe is a consumer-grade crypto payment link application powered by the Sui Network. Senders generate an encrypted payment link in 5 seconds. The recipient — who has never touched crypto — clicks the link, taps "Continue with Google", and the funds land in their account in under 2 seconds with **zero gas fees** and **zero wallet setup required**.

Built for the **Lofi the Yeti Hackathon (CLAY Hackathon III)**.

---

## 🚀 Key Features

* **Zero Seed Phrases:** Powered by Sui zkLogin (Google & Apple OAuth 2.0).
* **Zero Gas for Receivers:** 100% of recipient claim transactions are sponsored via Enoki / Sui Gas Station.
* **Non-Custodial Escrow:** Ephemeral Ed25519 private keys are stored **strictly in the URL hash fragment (`#`)**, ensuring zero intermediate server or CDN knowledge.
* **Lofi Mission Integration:** Built-in "Round up 10¢ to Clean Ocean Water" toggle routing micro-donations directly to the Lofi Foundation Clean Water Treasury on-chain.
* **Safety Timeout & Clawback:** Configurable 14-day clawback allowing senders to cancel and refund unclaimed links atomically.

---

## 🛠 Tech Stack

* **Frontend:** Next.js 15 (App Router, TypeScript)
* **Styling:** Tailwind CSS with custom CSS variable tokens
* **Animations:** Framer Motion
* **Blockchain:** Sui Network (Move 2024 beta)
* **Auth:** Sui zkLogin + Google OAuth
* **Gas Sponsorship:** Enoki Sponsored Transactions
* **Crypto SDK:** `@mysten/sui`
* **Package Manager:** `npm` (strictly required)

---

## 🎨 Color Palette & Typography

* `--color-ink`: `#121111` (primary text, dark surfaces)
* `--color-mist`: `#CCD3CD` (borders, subtle tints)
* `--color-frost`: `#C3CEEF` (accent, interactive highlights)
* `--color-white`: `#FFFFFF` (base background)
* `--color-snow`: `#F9F9F9` (alternating section backgrounds)
* Display: **Newsreader 300** (editorial serif)
* UI & Body: **Geist**
* Code & Addresses: **Geist Mono**

---

## 💻 Running Locally

1. **Install dependencies (npm only):**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** As specified in the product development constraints, do not execute `npm run build` or `npm run lint` in the local development environment.

---

## 📦 Move 2024 Smart Contract

The core escrow contract is located at `move/sources/escrow.move`:

* `floe::escrow::create_escrow<T>`: Deposits coins, splits optional clean-water donation, and shares the escrow object.
* `floe::escrow::claim_escrow<T>`: Verifies Ed25519 signature from URL hash fragment, transfers funds to recipient, and routes water donation.
* `floe::escrow::reclaim_escrow<T>`: Allows the sender to refund expired escrows atomically.

---

## 📄 License

MIT © Floe Protocol.
