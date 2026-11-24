import type { Metadata } from "next";

// Stays noindex through the dashboard layout while the figures include a sample baseline.
export const metadata: Metadata = {
  title: "Water impact · Floe",
  description:
    "Every 10¢ roundup goes to the Lofi ocean cleanup initiative when the link is claimed.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
