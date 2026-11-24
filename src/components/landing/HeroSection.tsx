import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";

export function HeroSection() {
  return (
    // Navbar and hero share one image and together fill one screen.
    <div className="on-dark relative flex min-h-svh flex-col overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <img
          src="/hero.avif"
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink/80" />
      </div>

      <Navbar overlay />

      <section aria-labelledby="hero-heading" className="relative flex flex-1 flex-col">
        {/* Bottom padding matches the navbar, so the copy centers on the whole screen */}
        <div className="container-standard flex flex-1 items-center justify-center pt-6 pb-16 text-center">
          <div className="hero-enter flex max-w-[52rem] flex-col items-center">
            <h1 id="hero-heading" className="type-display text-white">
              Send money with a link. <span className="sm:block">No wallet needed.</span>
            </h1>
            <p className="mt-5 max-w-[36rem] text-base leading-relaxed text-white/80 sm:mt-6 sm:text-lg">
              They click, log in with Google, and the money is theirs. No app. No seed phrase. No
              gas.
            </p>
            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row">
              <CreateLinkButton className="btn btn-dark-primary">
                <span>Create a payment link</span>
                <ArrowRight aria-hidden="true" />
              </CreateLinkButton>
              <a href="#how-it-works" className="btn btn-dark-secondary">
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroSection;
