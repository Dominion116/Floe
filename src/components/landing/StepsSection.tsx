import { Check } from "lucide-react";
import { GoogleIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/* Each step shows a piece of the real product instead of an icon. */

function CreateMoment() {
  return (
    <div className="w-full max-w-[15rem] text-center">
      <p className="type-figure text-5xl">
        <span className="text-ink-muted">$</span>20
      </p>
      <div className="mt-4 flex justify-center gap-2 text-sm font-medium tabular-nums">
        <span className="rounded-full border border-mist-dark px-3 py-1.5">$5</span>
        <span className="rounded-full border border-ink px-3 py-1.5">$20</span>
        <span className="rounded-full border border-mist-dark px-3 py-1.5">$50</span>
      </div>
    </div>
  );
}

function ShareMoment() {
  return (
    <div className="flex w-full max-w-[15rem] flex-col gap-2">
      <p className="self-start rounded-2xl rounded-bl-md bg-mist-light px-4 py-2.5 text-sm">
        I got lunch, you get coffee?
      </p>
      <div className="self-end rounded-2xl rounded-br-md bg-frost px-4 py-2.5 text-sm">
        <p>I sent you $20.00 with Floe.</p>
        <p className="mt-0.5 font-mono text-[13px] text-ink/75">floe.app/claim</p>
      </div>
    </div>
  );
}

function ClaimMoment() {
  return (
    <div className="flex w-full max-w-[15rem] flex-col gap-3">
      <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-mist-dark bg-white text-sm font-medium [&_svg]:h-4 [&_svg]:w-4">
        <GoogleIcon />
        Continue with Google
      </div>
      <p className="flex items-center justify-center gap-2 text-sm font-medium text-success">
        <Check className="h-4 w-4" />
        $20.00 is in your account
      </p>
    </div>
  );
}

const STEPS = [
  {
    title: "Create",
    body: "Pick an amount and get a private link.",
    moment: <CreateMoment />,
  },
  {
    title: "Share",
    body: "Send it on WhatsApp, Telegram, or iMessage.",
    moment: <ShareMoment />,
  },
  {
    title: "Claim",
    body: "Your friend logs in with Google or Apple. Done.",
    moment: <ClaimMoment />,
  },
];

export function StepsSection() {
  return (
    <section id="how-it-works" aria-labelledby="steps-heading" className="section-padding bg-snow">
      <div className="container-standard">
        <SectionHeader
          id="steps-heading"
          title="Sending money feels like sending a text"
          lede="Three steps for the two of you. Only the last one is theirs, and it takes one tap."
        />

        <Reveal>
          <ol className="grid overflow-hidden rounded-3xl border border-mist/70 bg-white md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <li
                key={step.title}
                className="flex flex-col border-mist/70 max-md:border-t max-md:first:border-t-0 md:border-l md:first:border-l-0"
              >
                <div
                  className="flex h-48 items-center justify-center px-6 lg:h-56"
                  aria-hidden="true"
                >
                  {step.moment}
                </div>
                <div className="px-6 pb-6 lg:px-8 lg:pb-8">
                  <h3 className="type-title">
                    <span className="mr-2 text-ink-muted tabular-nums">{idx + 1}</span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
