import { MAX_GIFT_BYTES, giftMime, type Gift } from "./gift";

/** Ready-made gifts. The artwork comes from art/yeti-cards.html. */
export const YETI_CARDS = [
  { id: "birthday", name: "Birthday", alt: "Happy birthday, with a yeti beside a cake" },
  { id: "thanks", name: "Thank you", alt: "Thank you, with a yeti holding a heart" },
  { id: "congrats", name: "Congrats", alt: "Congrats, with a yeti lifting a trophy" },
  { id: "holidays", name: "Holidays", alt: "Happy holidays, with a yeti beside a tree" },
] as const;

export type YetiCard = (typeof YETI_CARDS)[number];

export const cardThumb = (card: YetiCard) => `/cards/${card.id}-thumb.webp`;

const TIMEOUT_MS = 20_000;

/** From here on, a card is a photo like any other: sealed with the link's own key. */
export async function loadCard(card: YetiCard): Promise<Gift> {
  const res = await fetch(`/cards/${card.id}.jpg`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Card responded ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (giftMime(bytes) !== "image/jpeg" || bytes.length > MAX_GIFT_BYTES) {
    throw new Error("The card isn’t a photo");
  }
  return { mime: "image/jpeg", bytes, cardAlt: card.alt };
}
