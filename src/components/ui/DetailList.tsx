import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Detail {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

/** Label and value rows. Used wherever a transfer is summarised. */
export function DetailList({ items, className }: { items: Detail[]; className?: string }) {
  return (
    <dl className={cn("well px-4 py-3 space-y-2 text-sm text-left", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-4">
          <dt className="text-ink-muted shrink-0">{item.label}</dt>
          <dd
            className={cn(
              "min-w-0 text-right text-ink font-medium tabular-nums [overflow-wrap:anywhere]",
              item.mono && "font-mono text-[13px]"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
