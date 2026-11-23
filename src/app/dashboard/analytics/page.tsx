"use client";

import { PageShell } from "@/components/PageShell";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { DetailList } from "@/components/ui/DetailList";
import { NETWORK, WATER_TREASURY, explorerAccountUrl } from "@/lib/chain/config";
import { useLinks } from "@/lib/useLinks";
import { maskAddress } from "@/lib/utils";

export default function AnalyticsPage() {
  const { links } = useLinks();

  const totalTransfers = links.length;
  const claimedTransfers = links.filter((l) => l.status === "claimed").length;
  const claimRate = totalTransfers > 0 ? Math.round((claimedTransfers / totalTransfers) * 100) : 0;
  const waterDonationsCount = links.filter(
    (l) => l.hasWaterDonation && l.status === "claimed"
  ).length;
  const totalGallonsFiltered = 48290 + waterDonationsCount * 10;
  const totalWaterFundedUsd = (totalGallonsFiltered / 10) * 0.10;

  const stats = [
    {
      label: "Clean water funded",
      value: totalGallonsFiltered.toLocaleString("en-US"),
      note: "Gallons, including a sample baseline of 48,290",
    },
    {
      label: "Roundup value",
      value: `$${totalWaterFundedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      note: "10¢ from each roundup",
    },
    {
      label: "Your claim rate",
      value: `${claimRate}%`,
      note: `${claimedTransfers} of ${totalTransfers} links claimed`,
    },
  ];

  return (
    <PageShell>
      <h1 className="type-headline">Water impact</h1>
      <p className="type-lede mt-2">
        Every 10¢ roundup goes to the Lofi ocean cleanup initiative when the link is claimed.
      </p>

      <dl className="mt-8 grid gap-8 rounded-4xl bg-frost-light p-6 sm:p-10 md:grid-cols-3 md:gap-6 lg:mt-10">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="text-sm text-ink/75">{stat.label}</dt>
            <dd>
              <span className="type-figure mt-2 block text-4xl lg:text-5xl">{stat.value}</span>
              <span className="mt-2 block text-[13px] leading-5 text-ink/75">{stat.note}</span>
            </dd>
          </div>
        ))}
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
