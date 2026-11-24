import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { terms } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms of service · Floe",
  description: "The rules for creating, sharing, claiming and refunding Floe payment links.",
};

export default function TermsPage() {
  return <LegalPage doc={terms} related={{ href: "/privacy", label: "Read the privacy policy" }} />;
}
