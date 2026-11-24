"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";
import { useDialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#demo", label: "Claim demo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/analytics", label: "Water impact" },
  { href: "/docs", label: "Docs" },
];

/** Every docs page counts as Docs. */
const isCurrent = (href: string, pathname: string) =>
  pathname === href || (href === "/docs" && pathname.startsWith("/docs/"));

function Wordmark({ onClick, light }: { onClick?: () => void; light?: boolean }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Floe home"
      className={cn(
        "flex min-h-[44px] items-center rounded-md font-serif text-[28px] font-light tracking-[-0.03em] transition-colors duration-150",
        light ? "text-white" : "text-ink"
      )}
    >
      Floe
    </Link>
  );
}

/**
 * One navbar for the whole product: transparent, no border, scrolls with the page.
 * `overlay` uses light text, for sitting inside the dark landing hero.
 */
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const menu = useDialog(menuOpen, closeMenu);
  const light = overlay;

  return (
    <header
      className={cn(
        "relative z-20 shrink-0 bg-transparent",
        overlay && "on-dark"
      )}
    >
      <div className="container-standard flex h-16 items-center justify-between gap-4">
        <Wordmark light={light} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = isCurrent(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[40px] items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors duration-150 lg:px-4",
                  light
                    ? "text-white/80 hover:text-white"
                    : isActive
                      ? "bg-mist-light text-ink"
                      : "text-ink-muted hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <CreateLinkButton
            className={cn("btn btn-sm", light ? "btn-dark-primary" : "btn-primary")}
          >
            Create link
          </CreateLinkButton>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "btn-icon -mr-2 md:hidden",
              light && "text-white hover:bg-white/10 hover:text-white"
            )}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog {...menu} className="menu-sheet" aria-label="Menu">
        {menuOpen && (
          <>
            <div className="container-standard flex h-16 shrink-0 items-center justify-between">
              <Wordmark onClick={closeMenu} />
              <button
                type="button"
                onClick={closeMenu}
                className="btn-icon -mr-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="container-standard min-h-0 flex-1 overflow-y-auto py-6">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={isCurrent(link.href, pathname) ? "page" : undefined}
                      className="type-title flex min-h-[52px] items-center rounded-lg aria-[current=page]:underline aria-[current=page]:underline-offset-8"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="container-standard shrink-0 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <CreateLinkButton onOpen={closeMenu} className="btn btn-primary w-full">
                Create a payment link
              </CreateLinkButton>
            </div>
          </>
        )}
      </dialog>
    </header>
  );
}
