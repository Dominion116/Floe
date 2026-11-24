import Link from "next/link";
import { CreateLinkButton } from "@/components/create/CreateLinkProvider";

const linkClass =
  "inline-flex min-h-[44px] md:min-h-[32px] items-center rounded-sm text-sm text-ink-muted hover:text-ink transition-colors duration-150";

const PRODUCT_LINKS = [
  { href: "/#demo", label: "Claim demo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/analytics", label: "Water impact" },
];

const RESOURCE_LINKS = [
  { href: "/docs", label: "Documentation" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

const ECOSYSTEM_LINKS = [
  { href: "https://hackathon.lofitheyeti.com/", label: "Lofi the Yeti hackathon" },
  { href: "https://sui.io", label: "Sui Network" },
  {
    href: "https://docs.sui.io/guides/developer/cryptography/zklogin",
    label: "Sui zkLogin docs",
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-mist/60 bg-white">
      <div className="container-standard pt-12 pb-8 lg:pt-16">
        <div className="grid grid-cols-1 gap-10 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="min-[480px]:col-span-2 md:col-span-3 lg:col-span-2">
            <Link
              href="/"
              aria-label="Floe home"
              className="rounded-md font-serif text-[28px] font-light leading-none tracking-[-0.03em] text-ink"
            >
              Floe
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              Send money with a link. Recipients pay no gas and need no wallet, and Floe never holds
              the funds.
            </p>
          </div>

          <nav aria-labelledby="footer-product">
            <h2 id="footer-product" className="mb-2 text-sm font-medium text-ink">
              Product
            </h2>
            <ul>
              <li>
                <CreateLinkButton className={linkClass}>Create a payment link</CreateLinkButton>
              </li>
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-resources">
            <h2 id="footer-resources" className="mb-2 text-sm font-medium text-ink">
              Resources
            </h2>
            <ul>
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-ecosystem">
            <h2 id="footer-ecosystem" className="mb-2 text-sm font-medium text-ink">
              Ecosystem
            </h2>
            <ul>
              {ECOSYSTEM_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 text-[13px] text-ink-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Floe. Built for the Lofi the Yeti hackathon.</p>
          <p>Non-custodial escrow on Sui</p>
        </div>
      </div>
    </footer>
  );
}
