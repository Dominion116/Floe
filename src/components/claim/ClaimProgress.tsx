"use client";

import { Check, Loader2 } from "lucide-react";
import { ClaimVerificationState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ClaimProgressProps {
  state: ClaimVerificationState["step"];
}

const STEPS = [
  { key: "authenticating", label: "Authenticating…" },
  { key: "verifying", label: "Verifying…" },
  { key: "claiming", label: "Claiming…" },
];

export function ClaimProgress({ state }: ClaimProgressProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === state);

  return (
    <div role="status" className="rounded-3xl bg-snow px-6 py-12 text-center">
      <h2 className="type-title">Moving the money to you</h2>
      <p className="mt-1 text-sm text-ink-muted">Gas is covered, so you pay $0.00.</p>

      <ol className="mx-auto mt-8 w-fit space-y-4 text-left">
        {STEPS.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li
              key={s.key}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 text-base",
                isCurrent ? "font-medium text-ink" : "text-ink-muted"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
                {isDone ? (
                  <Check className="h-5 w-5 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-mist-dark" />
                )}
              </span>
              {s.label}
              {isDone && <span className="sr-only">done</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
