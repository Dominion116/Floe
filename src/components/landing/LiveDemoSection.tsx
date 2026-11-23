"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ClaimProgress } from "@/components/claim/ClaimProgress";
import { EnvelopeCard } from "@/components/claim/EnvelopeCard";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { GoogleIcon } from "@/components/ui/BrandIcons";
import { DetailList } from "@/components/ui/DetailList";
import { Reveal } from "@/components/ui/Reveal";
import { celebrate } from "@/lib/celebrate";

export function LiveDemoSection() {
  const [claimState, setClaimState] = useState<
    "idle" | "authenticating" | "verifying" | "claiming" | "success"
  >("idle");

  const runSimulation = () => {
    setClaimState("authenticating");
    setTimeout(() => {
      setClaimState("verifying");
      setTimeout(() => {
        setClaimState("claiming");
        setTimeout(() => {
          setClaimState("success");
          celebrate();
        }, 600);
      }, 500);
    }, 500);
  };

  const resetDemo = () => {
    setClaimState("idle");
  };

  const isProcessing =
    claimState === "authenticating" || claimState === "verifying" || claimState === "claiming";

  return (
    <section id="demo" aria-labelledby="demo-heading" className="section-padding bg-white">
      <div className="container-standard grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 id="demo-heading" className="type-headline">
            Claim $5 the way your friend would
          </h2>
          <p className="type-lede mt-4">
            This is what they see when they open your link. It’s a demo, so no wallet is connected
            and no tokens move.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mx-auto w-full max-w-md lg:mr-0">
          <div
            aria-live="polite"
            className="flex min-h-[27rem] flex-col justify-center rounded-4xl bg-snow p-4 sm:p-6"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isProcessing ? "processing" : claimState}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                {claimState === "idle" && (
                  <div className="space-y-4">
                    <EnvelopeCard
                      senderName="Alex"
                      amount={5}
                      recipientNote="Breakfast coffee is on me."
                      themeId="glacial"
                      hasWaterDonation
                    />
                    <button
                      type="button"
                      onClick={runSimulation}
                      className="btn btn-secondary w-full"
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </button>
                    <p className="type-help text-center">Demo only. You won’t be asked to log in.</p>
                  </div>
                )}

                {isProcessing && <ClaimProgress state={claimState} />}

                {claimState === "success" && (
                  <div className="space-y-6 text-center">
                    <div>
                      <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
                      <h3 className="type-title mt-4">$5.00 is in your account</h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        That’s the whole claim. One tap, no wallet.
                      </p>
                    </div>
                    <DetailList
                      className="bg-white"
                      items={[
                        { label: "Amount", value: "$5.00 (2.00 SUI)" },
                        { label: "Gas paid", value: "$0.00" },
                        { label: "Clean water", value: "10 gallons" },
                      ]}
                    />
                    <div className="flex flex-col gap-3">
                      <CreateLinkButton className="btn btn-primary w-full">
                        Send money to a friend
                      </CreateLinkButton>
                      <button type="button" onClick={resetDemo} className="btn btn-secondary w-full">
                        Reset demo
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
