"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Mic, Square, Trash2 } from "lucide-react";
import { GiftMedia } from "@/components/ui/GiftMedia";
import { giftNoun, type Gift } from "@/lib/gift";
import {
  MAX_VOICE_SECONDS,
  MediaError,
  canRecord,
  createRecorder,
  microphoneError,
  preparePhoto,
  prepareVoice,
} from "@/lib/media";
import { YETI_CARDS, cardThumb, loadCard, type YetiCard } from "@/lib/yetiCards";

interface GiftInputProps {
  gift: Gift | null;
  onChange: (gift: Gift | null) => void;
  /** True while a card or photo is being prepared or the microphone is on. */
  onBusyChange: (busy: boolean) => void;
}

interface Recording {
  stream: MediaStream;
  recorder: MediaRecorder;
  timer: ReturnType<typeof setInterval>;
  discarded: boolean;
}

export function GiftInput({ gift, onChange, onBusyChange }: GiftInputProps) {
  const [state, setState] = useState<"idle" | "working" | "recording">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [voiceSupported] = useState(canRecord);
  const recording = useRef<Recording | null>(null);
  const mounted = useRef(true);

  const move = (next: "idle" | "working" | "recording") => {
    setState(next);
    onBusyChange(next !== "idle");
  };

  // Leaving this step, or closing the window, always turns the microphone off.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const active = recording.current;
      if (active) {
        active.discarded = true;
        clearInterval(active.timer);
        if (active.recorder.state !== "inactive") active.recorder.stop();
        active.stream.getTracks().forEach((track) => track.stop());
        recording.current = null;
      }
      onBusyChange(false);
    };
  }, [onBusyChange]);

  const handleCard = async (card: YetiCard) => {
    setError(null);
    move("working");
    try {
      const gift = await loadCard(card);
      if (mounted.current) onChange(gift);
    } catch {
      setError("That card couldn’t be loaded. Check your connection, then try again.");
    } finally {
      if (mounted.current) move("idle");
    }
  };

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // So the same photo can be chosen again
    if (!file) return;
    setError(null);
    move("working");
    try {
      const photo = await preparePhoto(file);
      if (mounted.current) onChange(photo);
    } catch (err) {
      setError(err instanceof MediaError ? err.message : "That photo couldn’t be prepared. Try another one.");
    } finally {
      if (mounted.current) move("idle");
    }
  };

  const stopRecording = () => {
    if (recording.current?.recorder.state === "recording") recording.current.recorder.stop();
  };

  const startRecording = async () => {
    setError(null);
    move("working");
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tracks = stream.getTracks();
      if (!mounted.current) {
        tracks.forEach((track) => track.stop());
        return;
      }

      const recorder = createRecorder(stream);
      const chunks: Blob[] = [];
      const startedAt = Date.now();
      const active: Recording = {
        stream,
        recorder,
        discarded: false,
        timer: setInterval(() => {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          setSeconds(Math.min(elapsed, MAX_VOICE_SECONDS));
          if (elapsed >= MAX_VOICE_SECONDS) stopRecording();
        }, 250),
      };
      recording.current = active;

      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => {
        clearInterval(active.timer);
        tracks.forEach((track) => track.stop());
        if (recording.current === active) recording.current = null;
        if (active.discarded) return;
        try {
          const voice = await prepareVoice(chunks);
          if (mounted.current) onChange(voice);
        } catch (err) {
          setError(err instanceof MediaError ? err.message : "That recording couldn’t be saved. Try again.");
        } finally {
          if (mounted.current) move("idle");
        }
      };

      recorder.start();
      setSeconds(0);
      move("recording");
    } catch (err) {
      stream?.getTracks().forEach((track) => track.stop());
      if (recording.current) clearInterval(recording.current.timer);
      recording.current = null;
      if (!mounted.current) return;
      setError(microphoneError(err));
      move("idle");
    }
  };

  return (
    <div role="group" aria-labelledby="gift-label">
      <p id="gift-label" className="type-label mb-2">
        Card, photo or voice note <span className="font-normal text-ink-muted">(optional)</span>
      </p>

      {gift && state === "idle" ? (
        <div className="well space-y-3 p-3">
          <GiftMedia
            gift={gift}
            alt={gift.cardAlt ?? `Your ${giftNoun(gift)}`}
            className="max-h-64 w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange(null);
            }}
            className="btn btn-sm btn-ghost w-full"
          >
            <Trash2 aria-hidden="true" />
            <span>Remove {giftNoun(gift)}</span>
          </button>
        </div>
      ) : state === "recording" ? (
        <div className="well flex items-center justify-between gap-3 p-3">
          <p className="flex items-center gap-2 pl-1 text-sm font-medium tabular-nums text-ink">
            <span
              className="h-2.5 w-2.5 rounded-full bg-danger-solid motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <span className="sr-only" role="status">
              Recording
            </span>
            <span aria-hidden="true">
              {seconds}s of {MAX_VOICE_SECONDS}s
            </span>
          </p>
          <button type="button" autoFocus onClick={stopRecording} className="btn btn-sm btn-primary">
            <Square aria-hidden="true" />
            <span>Stop</span>
          </button>
        </div>
      ) : (
        <>
          <ul className="mb-3 grid grid-cols-4 gap-2" aria-label="Yeti cards">
            {YETI_CARDS.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  disabled={state === "working"}
                  onClick={() => void handleCard(card)}
                  aria-label={`Add the ${card.name} yeti card`}
                  className="group block w-full rounded-xl disabled:opacity-50"
                >
                  <img
                    src={cardThumb(card)}
                    alt=""
                    width={192}
                    height={240}
                    loading="lazy"
                    className="aspect-[4/5] h-auto w-full rounded-xl border border-mist/70 bg-mist-light object-cover transition-transform duration-150 group-active:scale-[0.97]"
                  />
                  <span className="type-help mt-1 block truncate text-center">{card.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`btn btn-sm btn-secondary cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
                voiceSupported ? "" : "col-span-2"
              }`}
              aria-disabled={state === "working"}
            >
              {state === "working" ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus aria-hidden="true" />
              )}
              <span>{state === "working" ? "One moment…" : "Add a photo"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={state === "working"}
                onChange={(e) => void handlePhoto(e)}
                className="sr-only"
              />
            </label>
            {voiceSupported && (
              <button
                type="button"
                disabled={state === "working"}
                onClick={() => void startRecording()}
                className="btn btn-sm btn-secondary"
              >
                <Mic aria-hidden="true" />
                <span>Record voice</span>
              </button>
            )}
          </div>
        </>
      )}

      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : (
        <p className="type-help mt-2">
          Encrypted before it leaves this device. Anyone with the link can open it.
        </p>
      )}
    </div>
  );
}
