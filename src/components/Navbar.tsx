"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, Droplets } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/send", label: "Send Money" },
    { href: "/#demo", label: "Claim Demo" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header role="banner" className="w-full bg-white/95 border-b border-mist/40 sticky top-0 z-40 transition-all backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand: Floe text only */}
        <Link
          href="/"
          className="group flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          aria-label="Floe Home"
        >
          <span className="font-serif font-light text-2xl tracking-[-0.03em] text-ink">
            Floe
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] px-3.5 py-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  isActive
                    ? "text-ink font-semibold bg-mist-light/70"
                    : "text-ink/70 hover:text-ink hover:bg-snow font-medium"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-ink/75 hover:text-ink hover:bg-snow transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[36px]"
            title="Lofi Mission Analytics"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Water Impact</span>
          </Link>
          <Link
            href="/send"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-white text-xs font-medium hover:bg-ink-soft transition-all shadow-subtle hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[38px]"
          >
            <span>Create Link</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-ink/80 hover:text-ink hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          role="region"
          aria-label="Mobile navigation"
          className="md:hidden border-b border-mist/40 bg-white px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                  isActive
                    ? "text-ink font-semibold bg-mist-light/70"
                    : "text-ink/75 hover:text-ink hover:bg-snow"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 flex flex-col gap-2.5 border-t border-mist/20">
            <Link
              href="/dashboard/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-ink/75 hover:bg-snow min-h-[44px]"
            >
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Clean Water Impact Ticker</span>
            </Link>
            <Link
              href="/send"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-all min-h-[44px] shadow-subtle active:scale-[0.97]"
            >
              <span>Create Payment Link</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
