"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Nav: drops from top with blur
  const navVariants: Variants = {
    hidden: { opacity: 0, y: -20, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 22, stiffness: 180, delay: 0.05 },
    },
  };

  // Background: slow fade in with scale down
  const bgVariants: Variants = {
    hidden: { opacity: 0, scale: 1.05 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0 },
    },
  };

  // Container for stagger
  const contentContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  // General item rise up
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 24, stiffness: 100 },
    },
  };

  // Title lines: more dramatic rise up
  const titleLineVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 28, stiffness: 80, mass: 1.2 },
    },
  };

  const navLinks = [
    { name: "Send Money", href: "/send" },
    { name: "Claim Demo", href: "/#demo" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Water Impact", href: "/dashboard/analytics" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans antialiased selection:bg-frost selection:text-ink bg-black flex flex-col justify-between">
      {/* ── Background Image ──────────────────────────────────────────────── */}
      <motion.div
        variants={bgVariants}
        initial="hidden"
        animate="show"
        className="pointer-events-none absolute inset-0 z-0 will-change-transform select-none"
      >
        <img
          src="https://assets.watermelon.sh/bg-hero-38.avif"
          alt="Atmospheric planet and aurora landscape"
          className="h-full w-full translate-y-20 object-cover object-bottom"
        />
        {/* Subtle top and bottom gradient blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85" />
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col justify-between">
        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate="show"
          aria-label="Main Navigation"
          style={{
            borderBottomWidth: isScrolled ? "1px" : "0px",
            borderBottomStyle: "solid",
            borderBottomColor: isScrolled ? "rgba(204, 211, 205, 0.4)" : "transparent",
          }}
          className={`fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md shadow-subtle"
              : "bg-transparent"
          }`}
        >
          {/* Logo: Floe text only */}
          <Link
            href="/"
            style={{ border: "none", outline: "none", boxShadow: "none" }}
            className="group flex items-center border-0 border-none outline-none ring-0 shadow-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded-md"
            aria-label="Floe Home"
          >
            <span
              style={{ border: "none", outline: "none", boxShadow: "none" }}
              className={`text-2xl font-serif font-light tracking-tight transition-colors border-0 border-none outline-none ring-0 shadow-none select-none ${
                isScrolled ? "text-ink" : "text-white"
              }`}
            >
              Floe
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-1 sm:gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isScrolled
                    ? "text-ink-muted hover:text-ink hover:bg-snow focus-visible:outline-ink"
                    : "text-mist hover:text-frost hover:bg-white/10 focus-visible:outline-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Header Action Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/send"
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 ease-out active:scale-[0.97] min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isScrolled
                  ? "bg-ink text-white hover:bg-ink-soft shadow-subtle focus-visible:outline-ink"
                  : "bg-white text-ink hover:bg-frost shadow-subtle focus-visible:outline-white"
              }`}
            >
              <span>Create Link</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-colors border-none outline-none focus-visible:ring-2 ${
                isScrolled
                  ? "text-ink-muted hover:text-ink hover:bg-snow focus-visible:ring-ink"
                  : "text-mist hover:text-white hover:bg-white/10 focus-visible:ring-white"
              }`}
              aria-label="Toggle mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              borderBottomWidth: isScrolled ? "1px" : "0px",
              borderBottomStyle: "solid",
              borderBottomColor: isScrolled ? "rgba(204, 211, 205, 0.4)" : "transparent",
            }}
            className={`md:hidden fixed top-[68px] left-0 right-0 z-40 px-6 py-5 space-y-2 shadow-floating transition-colors ${
              isScrolled
                ? "bg-white/98 backdrop-blur-md"
                : "bg-ink/98 backdrop-blur-md"
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-ink hover:bg-snow"
                    : "text-mist hover:text-frost hover:bg-white/10"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-mist/20">
              <Link
                href="/send"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all min-h-[44px] ${
                  isScrolled
                    ? "bg-ink text-white hover:bg-ink-soft"
                    : "bg-white text-ink hover:bg-frost"
                }`}
              >
                <span>Create Payment Link</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Main Hero Content ───────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-32 pb-20 sm:pt-40 sm:pb-28">
          <motion.div
            variants={contentContainerVariants}
            initial="hidden"
            animate="show"
            className="flex max-w-[840px] flex-col items-center"
          >
            {/* Headline */}
            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-[-0.03em] leading-[1.08] text-balance text-white">
              <motion.span
                variants={titleLineVariants}
                className="block will-change-transform"
              >
                Send Money With A Link.
              </motion.span>
              <motion.span
                variants={titleLineVariants}
                className="block will-change-transform italic font-normal text-white/90"
              >
                No Wallet Needed.
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-4 sm:mt-6 max-w-[620px] text-base sm:text-lg leading-relaxed text-pretty text-mist will-change-transform font-normal"
            >
              They click, log in with Google, and the money is theirs. No app install. No seed phrase. Instant 2-second settlement on Sui.
            </motion.p>

            {/* Unified Primary and Secondary Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-10 flex w-full flex-col sm:flex-row items-center justify-center gap-3.5 will-change-transform sm:w-auto"
            >
              <Link
                href="/send"
                className="btn-dark-primary w-full sm:w-auto min-w-[200px]"
              >
                <span>Create a Payment Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo"
                className="btn-dark-secondary w-full sm:w-auto min-w-[180px]"
              >
                <span>Try Live Claim Demo</span>
              </a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default HeroSection;
