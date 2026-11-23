"use client";

import { CARD_THEMES } from "@/lib/themes";
import { CardThemeId } from "@/lib/types";
import { ThemeIcon } from "@/components/ui/ThemeIcon";

interface ThemeSelectorProps {
  selectedThemeId: CardThemeId;
  onSelectTheme: (id: CardThemeId) => void;
}

export function ThemeSelector({ selectedThemeId, onSelectTheme }: ThemeSelectorProps) {
  return (
    <fieldset>
      <legend className="type-label mb-2">Envelope</legend>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(CARD_THEMES).map((theme) => (
          <label key={theme.id} className="option flex min-w-0 flex-col gap-3 rounded-2xl p-3">
            <input
              type="radio"
              name="envelope-theme"
              value={theme.id}
              checked={selectedThemeId === theme.id}
              onChange={() => onSelectTheme(theme.id)}
              className="sr-only"
            />
            <ThemeIcon theme={theme} />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-5 text-ink">{theme.name}</span>
              <span className="type-help block">{theme.subtitle}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
