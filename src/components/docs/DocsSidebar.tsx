"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DocsSearch, type SearchEntry } from "@/components/docs/DocsSearch";
import { cn } from "@/lib/utils";

export interface NavGroup {
  title: string;
  pages: { href: string; title: string }[];
}

function NavList({ groups, pathname }: { groups: NavGroup[]; pathname: string }) {
  return (
    <ul className="space-y-6">
      {groups.map((group) => (
        <li key={group.title}>
          <p className="type-label mb-1 px-3">{group.title}</p>
          <ul>
            {group.pages.map((page) => {
              const isActive = pathname === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center rounded-lg px-3 text-sm transition-colors duration-150 lg:min-h-[34px]",
                      isActive
                        ? "bg-mist-light font-medium text-ink"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** The left-hand column. Folds into a menu below 1024px. */
export function DocsSidebar({ groups, entries }: { groups: NavGroup[]; entries: SearchEntry[] }) {
  const pathname = usePathname();
  const current = groups.flatMap((g) => g.pages).find((p) => p.href === pathname);

  return (
    <div className="mb-8 lg:sticky lg:top-8 lg:mb-0 lg:max-h-[calc(100dvh-4rem)] lg:self-start lg:overflow-y-auto lg:p-1">
      <DocsSearch entries={entries} />

      {/* Remounts on navigation, so it closes */}
      <details key={pathname} className="group well mt-3 lg:hidden">
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 text-sm [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 truncate">
            <span className="text-ink-muted">Docs menu: </span>
            <span className="font-medium text-ink">{current?.title ?? "All pages"}</span>
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <nav aria-label="Docs" className="px-1 pb-4 pt-2">
          <NavList groups={groups} pathname={pathname} />
        </nav>
      </details>

      <nav aria-label="Docs" className="mt-6 hidden lg:block">
        <NavList groups={groups} pathname={pathname} />
      </nav>
    </div>
  );
}
