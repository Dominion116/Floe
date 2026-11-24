import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your links · Floe",
  description:
    "See which of your payment links were claimed, and refund the ones that weren’t.",
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
