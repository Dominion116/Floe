"use client";

interface NoteInputProps {
  note: string;
  onChangeNote: (val: string) => void;
}

const PRESET_NOTES = [
  "Thanks for lunch! ☕",
  "Happy Birthday! 🎉",
  "Split for the Uber 🚗",
  "Dinner drinks last night 🍸",
];

export function NoteInput({ note, onChangeNote }: NoteInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="transfer-note"
          className="block text-xs font-mono uppercase tracking-wider text-ink-muted"
        >
          Add a note
        </label>
        <span className="text-[10px] font-mono text-ink-muted" aria-live="polite">
          {note.length}/60
        </span>
      </div>

      <input
        id="transfer-note"
        type="text"
        maxLength={60}
        value={note}
        onChange={(e) => onChangeNote(e.target.value)}
        placeholder="e.g. Thanks for lunch yesterday! ☕"
        className="w-full px-4 py-3 rounded-xl border border-mist/50 bg-white text-ink text-base sm:text-sm placeholder:text-ink-muted/50 focus:outline-none focus:border-ink focus-visible:ring-1 focus-visible:ring-ink transition-colors"
      />

      <div className="flex flex-wrap gap-1.5 pt-1" role="group" aria-label="Suggested note presets">
        {PRESET_NOTES.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChangeNote(preset)}
            className="text-xs px-3 py-1.5 rounded-full bg-snow border border-mist/40 text-ink-muted hover:text-ink hover:border-mist transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-[32px] flex items-center"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
