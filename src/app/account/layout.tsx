import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your account · Floe",
  description:
    "See what you’ve received, and move it wherever you like.",
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
