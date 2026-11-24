import { A, Callout, DataTable } from "@/components/docs/Blocks";
import type { DocPage } from "@/content/types";
import { WATER_TREASURY, explorerAccountUrl } from "@/lib/chain/config";

export const water: DocPage = {
  slug: "water",
  file: "water.tsx",
  title: "Clean water roundup",
  description: "An optional 10¢ on top of a payment, sent to the Lofi Foundation treasury on claim.",
  sections: [
    {
      id: "how-it-works",
      title: "How it works",
      keywords: "donation 10 cents ocean lofi foundation",
      body: (
        <>
          <p>
            The roundup is added to the sender’s total. It never comes out of what the recipient
            gets. Floe converts 10¢ to the payment token at the live price, and the contract keeps
            that amount apart from the payment in the same escrow.
          </p>
          <DataTable
            label="Where the roundup goes"
            head={["When", "The roundup"]}
            rows={[
              ["The link is created", "Is locked in the escrow, separate from the payment"],
              ["The link is claimed", "Goes to the treasury in the same transaction"],
              ["The link is refunded", "Returns to the sender with the payment"],
              ["The link expires", "Stays in the escrow until the sender refunds it"],
            ]}
          />
          <p>
            The amount is fixed in tokens when the link is created, so its dollar value can move
            before the claim.
          </p>
        </>
      ),
    },
    {
      id: "turn-it-off",
      title: "Turn it off",
      body: (
        <p>
          The switch is on by default. Turn it off in the second step of{" "}
          <A href="/docs/send#personalize">creating a link</A>, and nothing is added to your total.
        </p>
      ),
    },
    {
      id: "treasury",
      title: "The treasury address",
      keywords: "verify onchain address CLEAN_WATER_TREASURY",
      body: (
        <>
          <p>
            The address is a constant in the contract, so neither the site nor a setting can redirect
            donations. It is the address published in the code of donate.lofifoundation.com.
          </p>
          <p>
            <a href={explorerAccountUrl(WATER_TREASURY)} target="_blank" rel="noopener noreferrer">
              <code>{WATER_TREASURY}</code>
            </a>
          </p>
        </>
      ),
    },
    {
      id: "figures",
      title: "About the figures",
      keywords: "gallons sample 48,290 impact",
      body: (
        <Callout title="Some totals are sample data">
          <p>
            The 48,290 gallons and 4,829 roundups on the site are sample figures for the hackathon
            build. “10 gallons per roundup” is the rate the interface uses, not a measurement by
            Floe. Your own count includes only links that were claimed.
          </p>
        </Callout>
      ),
    },
  ],
};
