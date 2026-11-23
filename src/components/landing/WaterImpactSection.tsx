import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function WaterImpactSection() {
  return (
    <section aria-labelledby="water-impact-heading" className="section-padding bg-snow">
      <div className="container-standard">
        <Reveal className="grid gap-10 rounded-4xl bg-frost-light p-6 sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-16">
          <div className="lg:col-span-7">
            <h2 id="water-impact-heading" className="type-headline">
              Every 10¢ roundup cleans 10 gallons of ocean water
            </h2>
            <p className="type-lede mt-4 text-ink/75">
              Turn it on when you create a link. The escrow contract sends the full 10¢ to the Lofi
              clean water treasury when the link is claimed.
            </p>
            <Link
              href="/dashboard/analytics"
              className="link mt-4 inline-flex min-h-[44px] items-center text-base font-medium"
            >
              See the water impact
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-6 self-end lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
            <div>
              <dt className="text-sm text-ink/75">Gallons funded</dt>
              <dd className="type-figure mt-1 text-4xl lg:text-5xl">48,290</dd>
            </div>
            <div>
              <dt className="text-sm text-ink/75">Roundups</dt>
              <dd className="type-figure mt-1 text-4xl lg:text-5xl">4,829</dd>
            </div>
            <div className="col-span-full text-[13px] text-ink/75">
              <dt className="sr-only">Source</dt>
              <dd>Sample figures for the hackathon build.</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
