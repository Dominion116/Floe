"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Modal, ModalClose } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export interface SearchEntry {
  href: string;
  title: string;
  /** The page a heading belongs to. Pages have their group instead. */
  context: string;
  keywords: string;
  isPage: boolean;
}

const MAX_RESULTS = 12;

function find(entries: SearchEntry[], query: string): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return entries.filter((e) => e.isPage);

  const score = (entry: SearchEntry) => {
    const title = entry.title.toLowerCase();
    const rest = `${entry.context} ${entry.keywords}`.toLowerCase();
    let total = entry.isPage ? 1 : 0;
    for (const term of terms) {
      if (title.startsWith(term)) total += 4;
      else if (title.includes(term)) total += 3;
      else if (rest.includes(term)) total += 1;
      else return 0;
    }
    return total;
  };

  return entries
    .map((entry) => ({ entry, score: score(entry) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((r) => r.entry);
}

function SearchPanel({ entries, onClose }: { entries: SearchEntry[]; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const results = useMemo(() => find(entries, query), [entries, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onClose();
      router.push(results[active].href);
    }
  };

  return (
    <>
      <header className="flex shrink-0 items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-6">
        <h2 id="docs-search-title" className="sr-only">
          Search the docs
        </h2>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search the docs"
          aria-expanded="true"
          aria-controls="docs-search-results"
          aria-activedescendant={results.length > 0 ? `docs-result-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search the docs"
          className="field min-w-0 flex-1"
        />
        <ModalClose onClose={onClose} />
      </header>
      <div className="modal-body pb-4 pt-3 sm:h-96 sm:flex-none">
        <p
          role="status"
          className={results.length > 0 ? "sr-only" : "px-3 py-6 text-base text-ink-muted"}
        >
          {results.length > 0
            ? `${results.length} ${results.length === 1 ? "result" : "results"}`
            : `Nothing matches “${query}”. Try a function, a setting or an error.`}
        </p>
        <ul ref={listRef} id="docs-search-results" role="listbox" aria-label="Results">
          {results.map((result, idx) => (
            <li
              key={result.href}
              id={`docs-result-${idx}`}
              role="option"
              aria-selected={idx === active}
              onMouseMove={() => setActive(idx)}
            >
              <Link
                href={result.href}
                tabIndex={-1}
                onClick={onClose}
                className={cn("block rounded-xl px-3 py-2.5", idx === active && "bg-mist-light")}
              >
                <span className="block text-[15px] font-medium leading-5 text-ink">
                  {result.title}
                </span>
                <span className="type-help block">{result.context}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function DocsSearch({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
    const handleShortcut = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return;
      // Another dialog is already open, and this one would cover it.
      if (document.querySelector("dialog[open]")) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-control bg-white px-3 text-sm text-ink-muted transition-colors duration-150 hover:border-ink lg:min-h-[40px]"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Search docs</span>
        <kbd className="hidden font-mono text-xs lg:block" aria-hidden="true">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="docs-search-title"
        className="h-[94dvh] sm:h-fit sm:max-w-[36rem]"
      >
        <SearchPanel entries={entries} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
