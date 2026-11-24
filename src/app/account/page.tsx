"use client";

import dynamic from "next/dynamic";
import { PageShell } from "@/components/PageShell";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";

// Wallets exist only in the browser.
const AccountView = dynamic(() => import("@/components/account/AccountView"), {
  ssr: false,
  loading: () => <AccountSkeleton />,
});

export default function AccountPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-md">
        <h1 className="type-headline">Your account</h1>
        <p className="type-lede mt-2">See what you’ve received, and move it wherever you like.</p>
        <div className="mt-8">
          <AccountView />
        </div>
      </div>
    </PageShell>
  );
}
