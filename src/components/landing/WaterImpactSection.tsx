"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { NETWORK } from "@/lib/chain/config";
import { useImpact } from "@/lib/useImpact";

export function WaterImpactSection() {
  const impact = useImpact();

  return (
    <section aria-labelledby="water-impact-heading" className="section-padding bg-snow">
      <div className="container-standard">
        <Reveal className="grid gap-10 rounded-4xl bg-frost-light p-6 sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-16">
          <div className="lg:col-span-7">
            <h2 id="water-impact-heading" className="type-headline">
              Every 10¢ roundup cleans 10 gallons of ocean water
            </h2>
            <p className="type-lede mt-4 text-ink/75">
              Turn it on when you create a link. The escrow contract sends the full roundup to the
              Lofi clean water treasury when the link is claimed.
            </p>
            <Link
              href="/dashboard/analytics"
              className="link mt-4 inline-flex min-h-[44px] items-center text-base font-medium"
            >
              See the water impact
            </Link>
          </div>

          <dl
            aria-busy={impact.status === "loading"}
            className="grid grid-cols-2 gap-6 self-end lg:col-span-4 lg:col-start-9 lg:grid-cols-1"
          >
            <div className="min-w-0">
              <dt className="text-sm text-ink/75">Sent to the treasury</dt>
              <dd className="type-figure mt-1 text-3xl [overflow-wrap:anywhere] lg:text-5xl">
                {impact.donated}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm text-ink/75">Roundups</dt>
              <dd className="type-figure mt-1 text-3xl [overflow-wrap:anywhere] lg:text-5xl">
                {impact.roundups}
              </dd>
            </div>
            <div className="col-span-full text-[13px] leading-5 text-ink/75">
              <dt className="sr-only">Source</dt>
              <dd role="status">
                {impact.status === "loading"
                  ? "Reading from Sui…"
                  : impact.status === "unavailable"
                    ? "Sui can’t be reached right now."
                    : impact.partial
                      ? "Older claims are still being read, so the real totals are higher."
                      : NETWORK === "testnet"
                        ? "Read from Sui Testnet, where coins have no real value."
                        : "Read live from Sui."}
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
