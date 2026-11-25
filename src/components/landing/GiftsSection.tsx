import type { ReactNode } from "react";
import { Check, Play } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { YETI_CARDS } from "@/lib/yetiCards";

/* Like the steps, each detail shows a piece of the real product. */

const WAVE = [28, 52, 40, 72, 96, 60, 80, 44, 68, 100, 76, 48, 84, 56, 36, 64, 88, 52, 32, 44];

function VoiceMoment() {
  return (
    <div className="flex w-full max-w-[16rem] items-center gap-3 rounded-full bg-frost-light py-2 pl-2 pr-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
        <Play className="h-4 w-4 fill-current" />
      </span>
      <span className="flex h-8 flex-1 items-center justify-between">
        {WAVE.map((height, idx) => (
          <span
            key={idx}
            style={{ height: `${height}%` }}
            className={cn("w-[3px] rounded-full", idx < 8 ? "bg-ink" : "bg-frost-dark")}
          />
        ))}
      </span>
      <span className="text-[13px] tabular-nums text-ink/75">0:12</span>
    </div>
  );
}

function SealedMoment() {
  return (
    <p className="w-full max-w-[16rem] rounded-2xl border border-mist/70 p-3 font-mono text-[13px] leading-6 [overflow-wrap:anywhere]">
      <span className="text-ink-muted">floeonsui.vercel.app/claim?id=0x8f2c…</span>
      <span className="rounded bg-frost box-decoration-clone px-1 text-ink">#k=…&amp;g=…</span>
    </p>
  );
}

function WithdrawMoment() {
  return (
    <div className="w-full max-w-[16rem] text-center">
      <p className="type-figure text-4xl">
        20.00 <span className="font-sans text-lg tracking-normal">SUI</span>
      </p>
      <p className="mt-3 flex min-h-[44px] items-center justify-center rounded-full bg-ink text-sm font-medium text-white">
        Withdraw SUI
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-success">
        <Check className="h-4 w-4" />
        Sent to your address
      </p>
    </div>
  );
}

const DETAILS: { title: string; body: string; moment: ReactNode }[] = [
  {
    title: "Say it yourself",
    body: "Record up to 30 seconds, or add a photo. Its location is removed first.",
    moment: <VoiceMoment />,
  },
  {
    title: "Only the link opens it",
    body: "Gifts are encrypted in your browser and stored on Walrus. Floe can’t open them.",
    moment: <SealedMoment />,
  },
  {
    title: "The money is theirs to move",
    body: "They can send it on as a new link, or withdraw it to any Sui address.",
    moment: <WithdrawMoment />,
  },
];

export function GiftsSection() {
  return (
    <section id="gifts" aria-labelledby="gifts-heading" className="section-padding bg-white">
      <div className="container-standard">
        <SectionHeader
          id="gifts-heading"
          title="Put something in the envelope"
          lede="Tap a yeti card, add a photo or record a voice note. It opens once they’ve claimed the money."
        />

        <Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {YETI_CARDS.map((card) => (
              <li key={card.id}>
                <img
                  src={`/cards/${card.id}-preview.webp`}
                  alt={card.alt}
                  width={560}
                  height={700}
                  loading="lazy"
                  className="aspect-[4/5] h-auto w-full rounded-2xl bg-mist-light object-cover sm:rounded-3xl"
                />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-4">
          <ul className="grid overflow-hidden rounded-3xl border border-mist/70 md:grid-cols-3">
            {DETAILS.map((detail) => (
              <li
                key={detail.title}
                className="flex flex-col border-mist/70 max-md:border-t max-md:first:border-t-0 md:border-l md:first:border-l-0"
              >
                <div className="flex h-48 items-center justify-center px-6" aria-hidden="true">
                  {detail.moment}
                </div>
                <div className="px-6 pb-6 lg:px-8 lg:pb-8">
                  <h3 className="type-title">{detail.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">{detail.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
