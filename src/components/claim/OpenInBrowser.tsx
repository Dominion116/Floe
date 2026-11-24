"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { suggestedBrowser } from "@/lib/inAppBrowser";

interface OpenInBrowserProps {
  /** The app this page is inside, when that is known. */
  app: string | null;
}

/**
 * Gets the whole link into a real browser. It only ever copies, because links that open another
 * app (such as Android's intent: links) use the # themselves and would lose the key.
 */
export function OpenInBrowser({ app }: OpenInBrowserProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const browser = suggestedBrowser();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      // Some in-app browsers block clipboard access
      setState("failed");
      requestAnimationFrame(() => inputRef.current?.select());
    }
  };

  return (
    <div className="rounded-2xl bg-warning-fill p-4 text-left">
      <p className="text-base font-medium text-ink">
        {app ? `Open this in ${browser} to log in` : `Try it in ${browser}`}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink">
        {app
          ? `Google often blocks logging in from inside ${app}. `
          : "Login needs a pop-up, and some browsers inside chat apps block it. "}
        Copy the link, open {browser} and paste it there. Your money stays safe in the link.
      </p>
      <button type="button" onClick={handleCopy} className="btn btn-sm btn-secondary mt-3 w-full">
        {state === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span>{state === "copied" ? `Copied. Now paste it in ${browser}` : "Copy link"}</span>
      </button>
      {state === "failed" && (
        <div className="mt-3">
          <label htmlFor="claim-link" className="type-help block">
            Copying is blocked here. Select the whole link and copy it yourself.
          </label>
          <input
            ref={inputRef}
            id="claim-link"
            type="text"
            readOnly
            value={window.location.href}
            onFocus={(e) => e.currentTarget.select()}
            className="field mt-2 font-mono"
          />
        </div>
      )}
      <p role="status" className="sr-only">
        {state === "copied" ? "Link copied" : ""}
      </p>
    </div>
  );
}
