import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finishing login · Floe",
  description: "Finishing your Google login.",
  robots: { index: false },
};

/** Where the Google login pop-up lands. The page that opened it reads the result and closes it. */
export default function AuthPage() {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh items-center justify-center p-6">
      <p role="status" className="text-base text-ink-muted">
        Finishing login…
      </p>
    </main>
  );
}
