import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Page not found · Floe",
  description: "This link may have expired, been claimed already, or been typed incorrectly.",
};

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center lg:py-20">
        <h1 className="type-headline">This link has melted away</h1>
        <p className="type-lede mt-4">
          It may have expired, been claimed already, or been typed incorrectly. Ask the sender for a
          new one.
        </p>
        <Link href="/" className="btn btn-primary mt-8 w-full sm:w-auto">
          Return home
        </Link>
      </div>
    </PageShell>
  );
}
