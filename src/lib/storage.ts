import { PaymentLinkRecord } from "./types";

const STORAGE_KEY = "floe_created_links_v1";

const SEED_LINKS: PaymentLinkRecord[] = [
  {
    id: "escrow_0x7b2f8491c1092e01",
    ephemeralPrivateKey: "suiprivkey_mock_1",
    ephemeralPublicKey: "0x892a01948ba1",
    amountUsd: 15.00,
    amountSui: 6.0,
    amountLofi: 300,
    currency: "USD",
    recipientNote: "Lunch at Yeti Cafe ☕",
    themeId: "coffee",
    waterDonationUsd: 0.10,
    waterDonationSui: 0.04,
    hasWaterDonation: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 13, // 13 days left
    status: "pending",
    viewsCount: 3,
  },
  {
    id: "escrow_0x4a9d1956e84920b2",
    ephemeralPrivateKey: "suiprivkey_mock_2",
    ephemeralPublicKey: "0x3456fe8901ab",
    amountUsd: 50.00,
    amountSui: 20.0,
    amountLofi: 1000,
    currency: "USD",
    recipientNote: "Happy 25th Birthday Sarah! 🎉",
    themeId: "birthday",
    waterDonationUsd: 0.10,
    waterDonationSui: 0.04,
    hasWaterDonation: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 12,
    status: "claimed",
    claimedByMasked: "0x4a81...3f1c",
    claimedAt: Date.now() - 1000 * 60 * 60 * 46,
    viewsCount: 5,
  },
  {
    id: "escrow_0x91ec084920b48192",
    ephemeralPrivateKey: "suiprivkey_mock_3",
    ephemeralPublicKey: "0x9810afb7492c",
    amountUsd: 10.00,
    amountSui: 4.0,
    amountLofi: 200,
    currency: "USD",
    recipientNote: "Uber split from the conference",
    themeId: "glacial",
    waterDonationUsd: 0.10,
    waterDonationSui: 0.04,
    hasWaterDonation: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24, // Expired 1 day ago
    status: "expired",
    viewsCount: 1,
  },
];

export function getStoredLinks(): PaymentLinkRecord[] {
  if (typeof window === "undefined") return SEED_LINKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LINKS));
      return SEED_LINKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_LINKS;
  } catch {
    return SEED_LINKS;
  }
}

export function saveCreatedLink(record: PaymentLinkRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredLinks();
    const updated = [record, ...existing.filter((item) => item.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save created link", err);
  }
}

export function updateLinkStatus(id: string, status: PaymentLinkRecord["status"]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredLinks();
    const updated = existing.map((item) => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update link status", err);
  }
}

export function getLinkById(id: string): PaymentLinkRecord | undefined {
  const links = getStoredLinks();
  return links.find((link) => link.id === id);
}
