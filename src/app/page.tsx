import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StepsSection } from "@/components/landing/StepsSection";
import { LiveDemoSection } from "@/components/landing/LiveDemoSection";
import { WaterImpactSection } from "@/components/landing/WaterImpactSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { ClosingCtaSection } from "@/components/landing/ClosingCtaSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Unified Hero + Navigation (Hero38 template) */}
      <HeroSection />

      <main className="flex-1">
        <StepsSection />
        <LiveDemoSection />
        <WaterImpactSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>

      <Footer />
    </div>
  );
}
