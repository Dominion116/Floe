"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocItem } from "@/content/types";
import { cn } from "@/lib/utils";

/** The last heading that has scrolled past the top of the screen. */
function useActiveId(items: TocItem[]): string | undefined {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const update = () => {
      let current = items[0]?.id;
      for (const { id } of items) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= 120) current = id;
      }
      // The last section may be too short to reach the top.
      const { scrollHeight, clientHeight } = document.documentElement;
      if (window.scrollY > 0 && window.scrollY + clientHeight >= scrollHeight - 4) {
        current = items[items.length - 1]?.id;
      }
      setActiveId(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return activeId;
}

/** The right-hand column. */
export function Toc({ items, className }: { items: TocItem[]; className?: string }) {
  const activeId = useActiveId(items);

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "sticky top-8 max-h-[calc(100dvh-4rem)] self-start overflow-y-auto p-1",
        className
      )}
    >
      <p className="type-label mb-2">On this page</p>
      <ul className="border-l border-mist/70">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1 text-[13px] leading-5 transition-colors duration-150",
                  item.level === 3 ? "pl-6" : "pl-3",
                  isActive
                    ? "border-ink font-medium text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                )}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Stands in for the column where there is no room for it. */
export function InlineToc({ items, className }: { items: TocItem[]; className?: string }) {
  return (
    <details className={cn("group well", className)}>
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown
          className="h-4 w-4 text-ink-muted transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <nav aria-label="On this page" className="px-4 pb-3">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex min-h-[44px] items-center text-sm text-ink-muted hover:text-ink",
                  item.level === 3 && "pl-4"
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
