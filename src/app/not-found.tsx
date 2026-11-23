import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mist-light text-ink text-xs font-mono uppercase tracking-wider mb-6">
        404 · Page Not Found
      </div>
      <h1 className="text-4xl sm:text-5xl font-serif font-light text-ink tracking-[-0.03em] mb-4">
        This link has melted away.
      </h1>
      <p className="text-ink-muted text-sm sm:text-base max-w-md mb-8 leading-relaxed font-normal">
        The link you followed may have expired, been claimed already, or was typed incorrectly.
      </p>
      <Link
        href="/"
        className="btn-primary"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
