"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, RefreshCw, ArrowRight, Droplet } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

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
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#C3CEEF", "#CCD3CD", "#121111", "#98A9E6"],
            });
          } catch {
            // Confetti fallback
          }
        }, 600);
      }, 500);
    }, 500);
  };

  const resetDemo = () => {
    setClaimState("idle");
  };

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="py-20 md:py-28 lg:py-32 bg-white border-t border-mist/30"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-frost/40 border border-frost text-ink text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-frost-dark" aria-hidden="true" />
            <span>Interactive Sandbox</span>
          </div>
          <h2
            id="demo-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-ink tracking-[-0.03em] leading-tight"
          >
            Experience the 2-Second Claim
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-xl mx-auto leading-relaxed font-normal">
            Test the recipient flow below without connecting a wallet or spending real tokens. See why 95% of first-time recipients complete the claim.
          </p>
        </motion.div>

        {/* Interactive Claim Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto bg-snow rounded-[28px] border border-mist/50 shadow-card p-6 sm:p-8"
        >
          <div aria-live="polite" className="w-full">
            <AnimatePresence mode="wait">
              {claimState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {/* Envelope Header */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F0F4FD] via-white to-[#E3EBFC] border border-frost/60 text-center relative overflow-hidden">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-frost/50 text-[11px] font-mono text-ink mb-3">
                      <Droplet className="w-3 h-3 text-sky-500" aria-hidden="true" />
                      <span>+$0.10 Water Donated</span>
                    </div>

                    {/* Sender Info with Real Avatar */}
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                        alt="Alex Morgan"
                        className="w-5 h-5 rounded-full object-cover border border-mist ring-1 ring-frost/60"
                      />
                      <p className="text-xs font-mono text-ink-muted uppercase tracking-wider">
                        Sender: Alex (via WhatsApp)
                      </p>
                    </div>

                    <div className="text-5xl font-serif font-light text-ink my-2 tracking-[-0.03em]">
                      $5.00
                    </div>
                    <p className="text-xs text-ink italic font-normal">
                      &ldquo;Here’s $5 for breakfast coffee. Have a great day!&rdquo;
                    </p>
                  </div>

                  {/* Receiver Action Button */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={runSimulation}
                      className="btn-secondary w-full"
                      aria-label="Simulate recipient Google authentication"
                    >
                      {/* Google Icon */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <p className="text-[11px] text-center text-ink-muted font-normal">
                      No gas fees or seed phrases. Powered by Sui zkLogin.
                    </p>
                  </div>
                </motion.div>
              )}

              {(claimState === "authenticating" ||
                claimState === "verifying" ||
                claimState === "claiming") && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-frost/40 border border-frost flex items-center justify-center animate-spin">
                    <RefreshCw className="w-6 h-6 text-ink" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl text-ink capitalize tracking-[-0.02em]">
                      {claimState === "authenticating" && "Authenticating with Google..."}
                      {claimState === "verifying" && "Verifying zkLogin signature..."}
                      {claimState === "claiming" && "Consensus claim executing on Sui..."}
                    </h3>
                    <p className="text-xs font-mono text-ink-muted">
                      Gas sponsored 100% via Enoki Gas Station ($0.00)
                    </p>
                  </div>
                </motion.div>
              )}

              {claimState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                  </div>

                  <div>
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Settled in 410 ms
                    </span>
                    <h3 className="font-serif text-3xl text-ink mt-3 tracking-[-0.03em]">
                      $5.00 is in your account
                    </h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Your newly derived Sui address: <span className="font-mono text-ink">0x8a92...c01f</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-mist/40 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Amount Received:</span>
                      <span className="font-semibold text-ink">$5.00 (2.00 SUI)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Gas Paid:</span>
                      <span className="font-semibold text-emerald-600">$0.00 (Sponsored)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Ocean Water Impact:</span>
                      <span className="font-semibold text-sky-600">10 Gallons Cleaned 💧</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/send"
                      className="btn-primary w-full"
                    >
                      <span>Send Money to a Friend Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={resetDemo}
                      className="btn-secondary w-full"
                    >
                      Reset Demo
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
