"use client";

import { CARD_THEMES } from "@/lib/themes";
import { CardThemeId } from "@/lib/types";
import { Snowflake, Coffee, Gift, Droplet, Check } from "lucide-react";

interface ThemeSelectorProps {
  selectedThemeId: CardThemeId;
  onSelectTheme: (id: CardThemeId) => void;
}

export function ThemeSelector({
  selectedThemeId,
  onSelectTheme,
}: ThemeSelectorProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "snowflake":
        return Snowflake;
      case "coffee":
        return Coffee;
      case "gift":
        return Gift;
      case "droplet":
      default:
        return Droplet;
    }
  };

  return (
    <div className="space-y-3">
      <span id="theme-selector-label" className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
        Gift Envelope Theme
      </span>
      <div
        role="radiogroup"
        aria-labelledby="theme-selector-label"
        className="grid grid-cols-2 gap-3"
      >
        {Object.values(CARD_THEMES).map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          const Icon = getIcon(theme.iconName);
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectTheme(theme.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[88px] ${
                isSelected
                  ? "border-ink bg-snow ring-1 ring-ink"
                  : "border-mist/50 bg-white hover:border-mist"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.accentColor }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <div
                    className="w-4 h-4 rounded-full bg-ink text-white flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">{theme.name}</p>
                <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                  {theme.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
