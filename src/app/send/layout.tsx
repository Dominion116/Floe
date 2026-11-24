import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a payment link · Floe",
  description:
    "Pick an amount, choose an envelope and share a private link. They log in with Google and the money is theirs.",
  alternates: { canonical: "/send" },
};

export default function SendLayout({ children }: { children: React.ReactNode }) {
  return children;
}
