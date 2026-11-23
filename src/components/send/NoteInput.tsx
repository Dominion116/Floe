"use client";

interface NoteInputProps {
  note: string;
  onChangeNote: (val: string) => void;
}

const PRESET_NOTES = ["Thanks for lunch!", "Happy birthday!", "For the ride", "Dinner last night"];

export function NoteInput({ note, onChangeNote }: NoteInputProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor="transfer-note" className="type-label">
          Note <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <span id="transfer-note-count" className="type-help tabular-nums">
          {note.length}/60
        </span>
      </div>

      <input
        id="transfer-note"
        type="text"
        maxLength={60}
        autoComplete="off"
        aria-describedby="transfer-note-count"
        value={note}
        onChange={(e) => onChangeNote(e.target.value)}
        placeholder="Thanks for lunch!"
        className="field"
      />

      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Suggested notes">
        {PRESET_NOTES.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={note === preset}
            onClick={() => onChangeNote(preset)}
            className="btn btn-sm btn-secondary font-normal aria-pressed:border-ink"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
