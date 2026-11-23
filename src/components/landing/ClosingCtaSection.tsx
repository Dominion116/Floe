import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCtaSection() {
  return (
    <section aria-labelledby="closing-cta-heading" className="bg-white pb-16 sm:pb-20 lg:pb-28">
      <div className="container-standard">
        <Reveal className="on-dark rounded-4xl bg-ink px-6 py-16 text-center sm:px-10 sm:py-20 lg:py-28">
          {/* Signature move: brightness-ramp closing headline (45% → 70% → 100%) */}
          <h2 id="closing-cta-heading" className="type-display text-white">
            <span className="block text-white/45">Money should move</span>{" "}
            <span className="block text-white/70">as fast as a message.</span>{" "}
            <span className="block">With a single link.</span>
          </h2>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:mt-12">
            <CreateLinkButton className="btn btn-dark-primary">
              <span>Create a payment link</span>
              <ArrowRight aria-hidden="true" />
            </CreateLinkButton>
            <Link href="/dashboard" className="btn btn-dark-secondary">
              View dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
