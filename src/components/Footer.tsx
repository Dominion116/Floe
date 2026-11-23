import Link from "next/link";
import { Droplet, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer aria-label="Site Footer" className="w-full border-t border-mist/30 bg-white pt-16 pb-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-mist/20">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded-md">
              <span className="font-serif font-light text-3xl tracking-[-0.03em] text-ink">
                Floe
              </span>
            </Link>
            <p className="text-sm text-ink/75 max-w-sm leading-relaxed font-normal">
              The 2-second payment link on Sui. Zero gas fees for receivers, zero seed phrases, and trustless URL fragment cryptography.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink/70">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                Non-Custodial Escrow
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Sponsored Gas (Enoki)
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-4">
              Surfaces
            </h4>
            <ul className="space-y-3 text-sm text-ink/70">
              <li>
                <Link href="/send" className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink rounded">
                  Create Payment Link
                </Link>
              </li>
              <li>
                <Link href="/#demo" className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink rounded">
                  Claim Simulation Demo
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink rounded">
                  Sender Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/analytics" className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink rounded">
                  Water Impact & Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech & Ecosystem */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-4">
              Lofi Hackathon
            </h4>
            <ul className="space-y-3 text-sm text-ink/70">
              <li>
                <a
                  href="https://hackathon.lofitheyeti.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  <span>Lofi The Yeti Hackathon</span>
                </a>
              </li>
              <li>
                <a
                  href="https://sui.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  Sui Network
                </a>
              </li>
              <li>
                <a
                  href="https://docs.sui.io/guides/developer/cryptography/zklogin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  Sui zkLogin Documentation
                </a>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-mist-light text-[11px] text-ink font-mono">
                  <Droplet className="w-3 h-3 text-sky-500" aria-hidden="true" />
                  10¢ Clean Ocean Mission
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink/70 gap-4">
          <p>© {new Date().getFullYear()} Floe Protocol. Built for the Lofi the Yeti Hackathon.</p>
          <p className="font-mono text-[11px]">
            Package: <span className="text-ink font-semibold">Move 2024</span> · Protocol: <span className="text-ink font-semibold">Sui zkLogin</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
