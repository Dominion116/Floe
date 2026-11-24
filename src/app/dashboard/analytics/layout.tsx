import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water impact · Floe",
  description:
    "Every 10¢ roundup goes to the Lofi ocean cleanup initiative when the link is claimed.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
