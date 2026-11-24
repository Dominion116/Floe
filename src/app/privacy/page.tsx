import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacy } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy policy · Floe",
  description: "What Floe stores, what it never sees, and which services are involved in a payment.",
};

export default function PrivacyPage() {
  return <LegalPage doc={privacy} related={{ href: "/terms", label: "Read the terms of service" }} />;
}
