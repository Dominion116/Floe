"use client";

import { PageShell } from "@/components/PageShell";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { DetailList } from "@/components/ui/DetailList";
import { StatCard } from "@/components/ui/StatCard";
import { NETWORK, WATER_TREASURY, explorerAccountUrl } from "@/lib/chain/config";
import { useImpact } from "@/lib/useImpact";
import { useLinks } from "@/lib/useLinks";
import { approxUsd, maskAddress } from "@/lib/utils";

export default function AnalyticsPage() {
  const { links } = useLinks();

  const totalTransfers = links.length;
  const claimedTransfers = links.filter((l) => l.status === "claimed").length;
  const claimRate = totalTransfers > 0 ? Math.round((claimedTransfers / totalTransfers) * 100) : 0;
  const impact = useImpact();

  const stats = [
    { label: "Sent to the treasury", value: impact.donated, note: "By every Floe claim" },
    {
      label: "Roundups",
      value: impact.roundups,
      note:
        impact.claims === null
          ? "From claimed links"
          : `From ${impact.claims} claimed ${impact.claims === 1 ? "link" : "links"}`,
    },
    {
      label: "Water funded",
      value: impact.gallons,
      note:
        impact.usd === null
          ? "At 10 gallons per 10¢"
          : `${approxUsd(impact.usd)} at live prices, at 10 gallons per 10¢`,
    },
  ];

  return (
    <PageShell>
      <h1 className="type-headline">Water impact</h1>
      <p className="type-lede mt-2">
        Every 10¢ roundup goes to the Lofi ocean cleanup initiative when the link is claimed.
      </p>

      <dl
        aria-busy={impact.status === "loading"}
        className="mt-8 grid gap-8 rounded-4xl bg-frost-light p-6 sm:p-10 md:grid-cols-3 md:gap-6 lg:mt-10"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="text-sm text-ink/75">{stat.label}</dt>
            <dd>
              <span className="type-figure mt-2 block text-4xl [overflow-wrap:anywhere] lg:text-5xl">
                {stat.value}
              </span>
              <span className="mt-2 block text-[13px] leading-5 text-ink/75">{stat.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p role="status" className="type-help mt-3">
        {impact.status === "loading"
          ? "Reading from Sui…"
          : impact.status === "unavailable"
            ? "Sui can’t be reached right now, so these totals aren’t shown."
            : impact.partial
              ? "Older claims are still being read, so the real totals are higher."
              : NETWORK === "testnet"
                ? "Read from Sui Testnet, where coins have no real value. The gallons show how the count works."
                : "Read live from Sui. Gallons are an estimate at live prices."}
      </p>

      <dl className="mt-4">
        <StatCard
          label="Your claim rate"
          value={`${claimRate}%`}
          note={`${claimedTransfers} of ${totalTransfers} links created in this browser`}
        />
      </dl>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card flex flex-col p-6 sm:p-8">
          <h2 className="type-title">How the 10¢ is protected</h2>
          <p className="mt-2 mb-6 text-base leading-relaxed text-ink-muted">
            The escrow contract splits the roundup into its own coin and sends it to the treasury
            when the link is claimed.
          </p>
          <DetailList
            className="mt-auto"
            items={[
              { label: "Network", value: NETWORK === "mainnet" ? "Sui Mainnet" : "Sui Testnet" },
              { label: "Module", value: "floe::escrow", mono: true },
              {
                label: "Treasury",
                value: (
                  <a
                    href={explorerAccountUrl(WATER_TREASURY)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    {maskAddress(WATER_TREASURY)}
                  </a>
                ),
                mono: true,
              },
            ]}
          />
        </section>

        <section className="card flex flex-col items-start p-6 sm:p-8">
          <h2 className="type-title">Add yours</h2>
          <p className="mt-2 mb-6 text-base leading-relaxed text-ink-muted">
            Lunch splits, birthdays and coffee all count. Turn on the roundup when you personalize
            your link.
          </p>
          <CreateLinkButton className="btn btn-primary mt-auto w-full sm:w-auto">
            Create a payment link
          </CreateLinkButton>
        </section>
      </div>
    </PageShell>
  );
}
