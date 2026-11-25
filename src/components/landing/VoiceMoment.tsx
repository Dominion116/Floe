"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const WAVE = [28, 52, 40, 72, 96, 60, 80, 44, 68, 100, 76, 48, 84, 56, 36, 64, 88, 52, 32, 44];
const SAMPLE_TEXT = "Hey, thanks for lunch! Grab a coffee on me today.";
const DURATION_SECONDS = 5;
const FALLBACK_DURATION_MS = DURATION_SECONDS * 1000;
const MAX_SPEECH_WAIT_MS = 12_000;
const IDLE_BARS = 8;

function formatTime(seconds: number): string {
  const clamped = Math.max(0, Math.min(DURATION_SECONDS, Math.floor(seconds)));
  return `0:${String(clamped).padStart(2, "0")}`;
}

function pickEnglishVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (voices.length === 0) return null;
  const english = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = english.length > 0 ? english : voices;
  return (
    pool.find((v) => /natural|online|samantha|aria|jenny|daniel|google/i.test(v.name)) ??
    pool.find((v) => v.localService) ??
    pool[0] ??
    null
  );
}

/** Interactive sample voice note on the landing page. */
export function VoiceMoment() {
  const [status, setStatus] = useState<"idle" | "playing" | "played">("idle");
  const [progress, setProgress] = useState(0);

  const runIdRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (speakDelayRef.current) clearTimeout(speakDelayRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    if (resetRef.current) clearTimeout(resetRef.current);
    tickRef.current = null;
    speakDelayRef.current = null;
    safetyRef.current = null;
    resetRef.current = null;
  }, []);

  const stop = useCallback(
    (nextStatus: "idle" | "played" = "idle") => {
      runIdRef.current += 1;
      clearTimers();
      utteranceRef.current = null;

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const synth = window.speechSynthesis;
        if (synth.speaking || synth.pending) synth.cancel();
      }

      setStatus(nextStatus);
      setProgress(nextStatus === "played" ? 1 : 0);

      if (nextStatus === "played") {
        resetRef.current = setTimeout(() => {
          setStatus("idle");
          setProgress(0);
        }, 4000);
      }
    },
    [clearTimers]
  );

  // Preload browser voices and stop speech if the visitor leaves the page.
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => stop("idle");
  }, [stop]);

  const handleToggle = () => {
    if (status === "playing") {
      stop("idle");
      return;
    }

    clearTimers();
    const runId = ++runIdRef.current;
    const startedAt = Date.now();
    let speechActive = false;

    setStatus("playing");
    setProgress(0);

    const finish = () => {
      if (runId !== runIdRef.current) return;
      stop("played");
    };

    tickRef.current = setInterval(() => {
      if (runId !== runIdRef.current) return;
      const elapsed = Date.now() - startedAt;
      if (speechActive) {
        setProgress(Math.min(0.95, elapsed / FALLBACK_DURATION_MS));
      } else {
        const next = Math.min(1, elapsed / FALLBACK_DURATION_MS);
        setProgress(next);
        if (next >= 1) finish();
      }
    }, 60);

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined"
    ) {
      const synth = window.speechSynthesis;
      const speak = () => {
        if (runId !== runIdRef.current) return;
        try {
          const utterance = new SpeechSynthesisUtterance(SAMPLE_TEXT);
          const voice = pickEnglishVoice(synth);
          if (voice) utterance.voice = voice;
          utterance.lang = voice?.lang || "en-US";
          utterance.rate = 1.0;
          utterance.pitch = 1.0;

          speechActive = true;
          utteranceRef.current = utterance;

          utterance.onend = () => finish();
          utterance.onerror = () => {
            // Fall back to the visual timer if browser speech fails.
            speechActive = false;
            if (safetyRef.current) {
              clearTimeout(safetyRef.current);
              safetyRef.current = null;
            }
          };

          safetyRef.current = setTimeout(finish, MAX_SPEECH_WAIT_MS);
          synth.speak(utterance);
        } catch {
          speechActive = false;
        }
      };

      if (synth.speaking || synth.pending) {
        synth.cancel();
        speakDelayRef.current = setTimeout(speak, 50);
      } else {
        speak();
      }
    }
  };

  const isPlaying = status === "playing";
  const activeBars =
    status === "idle" ? IDLE_BARS : Math.max(1, Math.round(progress * WAVE.length));
  const timeLabel = isPlaying
    ? formatTime(progress * DURATION_SECONDS)
    : formatTime(DURATION_SECONDS);

  return (
    <div className="flex w-full max-w-[16rem] flex-col items-center">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? "Stop sample voice note" : "Play sample voice note"}
        aria-pressed={isPlaying}
        className="group flex w-full items-center gap-3 rounded-full bg-frost-light py-2 pl-2 pr-5 transition-[background-color,transform] duration-150 hover:bg-frost/70 active:scale-[0.98]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-150 group-hover:bg-ink-soft">
          {isPlaying ? (
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          )}
        </span>
        <span className="flex h-8 flex-1 items-center justify-between" aria-hidden="true">
          {WAVE.map((height, idx) => {
            const lit = idx < activeBars;
            const current = isPlaying && idx === activeBars - 1;
            return (
              <span
                key={idx}
                style={{ height: `${height}%` }}
                className={cn(
                  "w-[3px] rounded-full transition-colors duration-150",
                  lit ? "bg-ink" : "bg-frost-dark",
                  current && "motion-safe:scale-y-110"
                )}
              />
            );
          })}
        </span>
        <span className="w-8 text-right text-[13px] tabular-nums text-ink/75">{timeLabel}</span>
      </button>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          "mt-3 flex min-h-[2.5rem] items-center text-center text-[13px] leading-5 transition-colors duration-150",
          status === "idle" ? "text-ink-muted" : "text-ink"
        )}
      >
        {status === "idle" ? "Tap play to hear a sample" : `“${SAMPLE_TEXT}”`}
      </p>
    </div>
  );
}
