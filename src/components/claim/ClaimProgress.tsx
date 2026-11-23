"use client";

import { motion } from "framer-motion";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { ClaimVerificationState } from "@/lib/types";

interface ClaimProgressProps {
  state: ClaimVerificationState["step"];
}

export function ClaimProgress({ state }: ClaimProgressProps) {
  const steps = [
    { key: "authenticating", label: "Authenticating zkLogin..." },
    { key: "verifying", label: "Verifying Ed25519 hash signature..." },
    { key: "claiming", label: "Executing atomic PTB on Sui..." },
  ];

  const currentIdx = steps.findIndex((s) => s.key === state);

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-snow rounded-3xl p-8 border border-mist/50 text-center space-y-6"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-frost/40 border border-frost flex items-center justify-center animate-spin">
        <RefreshCw className="w-7 h-7 text-ink" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h3 className="font-serif text-2xl font-light text-ink tracking-[-0.03em]">
          Claiming funds into your account...
        </h3>
        <p className="text-xs font-mono text-ink-muted">
          Gas 100% sponsored via Enoki Gas Station (<span className="text-emerald-600 font-semibold">$0.00</span>)
        </p>
      </div>

      {/* Progress steps pill */}
      <div className="space-y-2 max-w-xs mx-auto text-left pt-2">
        {steps.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-mono transition-colors ${
                isCurrent
                  ? "bg-white border border-frost text-ink font-medium"
                  : isDone
                  ? "text-emerald-700 bg-emerald-50/60"
                  : "text-ink-muted opacity-40"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              ) : isCurrent ? (
                <div
                  className="w-4 h-4 rounded-full border-2 border-ink border-t-transparent animate-spin shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <div className="w-4 h-4 rounded-full border border-mist shrink-0" aria-hidden="true" />
              )}
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
