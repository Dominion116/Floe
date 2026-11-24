import type { ReactNode } from "react";
import Link from "next/link";
import { Info, TriangleAlert } from "lucide-react";
import { CopyButton } from "@/components/docs/CopyButton";
import { tokenize, type CodeToken, type Lang } from "@/lib/highlight";
import { cn } from "@/lib/utils";

const TOKEN_CLASS: Record<CodeToken["kind"], string | undefined> = {
  plain: undefined,
  comment: "text-ink-muted",
  string: "text-code-string",
  keyword: "text-code-keyword",
};

interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** File name, or what the snippet is. */
  title: string;
}

export function CodeBlock({ code, lang = "text", title }: CodeBlockProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-mist/70 bg-snow">
      <figcaption className="flex items-center justify-between gap-4 border-b border-mist/70 py-0.5 pl-4 pr-1">
        <span className="min-w-0 truncate font-mono text-[13px] text-ink-muted">{title}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label={`Code: ${title}`}
        className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.6] text-ink focus-visible:-outline-offset-2"
      >
        <code>
          {tokenize(code, lang).map((token, idx) => (
            <span key={idx} className={TOKEN_CLASS[token.kind]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

interface CalloutProps {
  kind?: "note" | "warning";
  title: string;
  children: ReactNode;
}

export function Callout({ kind = "note", title, children }: CalloutProps) {
  const Icon = kind === "warning" ? TriangleAlert : Info;
  return (
    <aside
      aria-label={title}
      className={cn(
        "flex gap-3 rounded-2xl border p-4",
        kind === "warning" ? "border-warning/25 bg-warning-fill" : "border-frost bg-frost-light"
      )}
    >
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", kind === "warning" ? "text-warning" : "text-ink")}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-[15px] font-medium leading-relaxed text-ink">{title}</p>
        <div className="doc mt-1 text-[15px] text-ink">{children}</div>
      </div>
    </aside>
  );
}

interface DataTableProps {
  label: string;
  head: string[];
  rows: ReactNode[][];
  /** Indexes of the columns set in mono. */
  mono?: number[];
}

/** Scrolls sideways inside its own frame, so the page never does. */
export function DataTable({ label, head, rows, mono = [] }: DataTableProps) {
  const cell = (idx: number) =>
    cn(
      "px-4 py-2.5 text-left align-top",
      mono.includes(idx) && "whitespace-nowrap font-mono text-[13px] leading-[1.6rem]"
    );

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={label}
      className="overflow-x-auto rounded-xl border border-mist/70 focus-visible:-outline-offset-2"
    >
      <table className="w-full min-w-[30rem] border-collapse text-[15px] leading-relaxed">
        <thead>
          <tr className="bg-snow text-[13px] text-ink-muted">
            {head.map((title) => (
              <th key={title} scope="col" className="px-4 py-2.5 text-left font-medium">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-t border-mist/70">
              {row.map((value, idx) =>
                idx === 0 ? (
                  <th key={idx} scope="row" className={cn(cell(idx), "font-medium text-ink")}>
                    {value}
                  </th>
                ) : (
                  <td key={idx} className={cn(cell(idx), "text-ink-muted")}>
                    {value}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** In-site links stay in the app. Everything else opens in a new tab. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href}>{children}</Link>;
  if (href.startsWith("mailto:")) return <a href={href}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const LINK_PARTS = [
  {
    text: "https://floeonsui.vercel.app/claim",
    label: "Page",
    seen: "Sent to the server. The same for every link.",
    className: "bg-mist-light",
  },
  {
    text: "?id=0x8f2c…41de",
    label: "Escrow ID",
    seen: "Sent to the server, and public on Sui.",
    className: "bg-theme-water",
  },
  {
    text: "#k=suiprivkey1…&n=Thanks+for+lunch!",
    label: "Key and note",
    seen: "Read by the browser. Not sent to Floe’s server.",
    className: "bg-frost",
  },
];

/** The three parts of a claim link, and who can see each one. */
export function LinkAnatomy() {
  return (
    <figure className="rounded-xl border border-mist/70 p-4 sm:p-5">
      <p className="font-mono text-[13px] leading-7 text-ink [overflow-wrap:anywhere]">
        {LINK_PARTS.map((part) => (
          <span
            key={part.label}
            className={cn("rounded box-decoration-clone px-1 py-0.5", part.className)}
          >
            {part.text}
          </span>
        ))}
      </p>
      <figcaption>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {LINK_PARTS.map((part) => (
            <div key={part.label}>
              <dt className="flex items-center gap-2 text-sm font-medium text-ink">
                <span className={cn("h-3 w-3 rounded-sm", part.className)} aria-hidden="true" />
                {part.label}
              </dt>
              <dd className="mt-1 text-[13px] leading-5 text-ink-muted">{part.seen}</dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}
