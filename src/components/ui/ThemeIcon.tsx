import { Coffee, Droplet, Gift, Snowflake } from "lucide-react";
import { CardTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Droplet> = {
  snowflake: Snowflake,
  coffee: Coffee,
  gift: Gift,
  droplet: Droplet,
};

export function ThemeIcon({ theme }: { theme: CardTheme }) {
  const Icon = ICONS[theme.iconName] ?? Droplet;
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink",
        theme.accentClass
      )}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
