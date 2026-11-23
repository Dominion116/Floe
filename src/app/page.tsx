import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StepsSection } from "@/components/landing/StepsSection";
import { LiveDemoSection } from "@/components/landing/LiveDemoSection";
import { WaterImpactSection } from "@/components/landing/WaterImpactSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { ClosingCtaSection } from "@/components/landing/ClosingCtaSection";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <main id="main" tabIndex={-1} className="flex-1">
        <HeroSection />
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
