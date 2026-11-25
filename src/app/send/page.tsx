"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { CreateLinkButton, useCreateLink } from "@/components/create/CreateLinkProvider";
import { DetailList } from "@/components/ui/DetailList";

export default function SendPage() {
  const { openCreateLink } = useCreateLink();

  // Landing on /send directly goes straight into the wizard.
  useEffect(() => {
    openCreateLink();
  }, [openCreateLink]);

  return (
    <PageShell>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="type-headline">Create a payment link</h1>
          <p className="type-lede mt-4">
            Pick an amount, add a yeti card or a voice note, and share a private link. They log in with
            Google and the money is theirs.
          </p>
          <CreateLinkButton className="btn btn-primary mt-8 w-full sm:w-auto">
            Create a payment link
          </CreateLinkButton>
        </div>
        <div className="space-y-4 w-full max-w-md mx-auto lg:mr-0">
          <EnvelopeCard amount={20} recipientNote="Thanks for lunch!" themeId="glacial" hasGift />
          <DetailList
            items={[
              { label: "Gas for them", value: "$0.00" },
              { label: "Wallet needed", value: "No" },
              { label: "If unclaimed", value: "Refund it to yourself" },
            ]}
          />
        </div>
      </div>
    </PageShell>
  );
}
