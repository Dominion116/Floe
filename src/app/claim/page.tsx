"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { ClaimSkeleton } from "@/components/claim/ClaimSkeleton";

// Wallets exist only in the browser.
const ClaimFlow = dynamic(() => import("@/components/claim/ClaimFlow"), {
  ssr: false,
  loading: () => <ClaimSkeleton />,
});

export default function ClaimPage() {
  return (
    <PageShell>
      <Suspense fallback={<ClaimSkeleton />}>
        <ClaimFlow />
      </Suspense>
    </PageShell>
  );
}
