import type { Metadata } from "next";

// No canonical URL: some share sheets use it in place of the real address, which would drop the key.
export const metadata: Metadata = {
  title: "You’ve been sent money · Floe",
  description:
    "Log in with Google to claim it. No wallet, no app and no gas to pay.",
  robots: { index: false },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
