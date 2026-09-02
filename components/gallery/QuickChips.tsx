"use client";

import { useAppState } from "@/components/providers/AppState";

const CHIPS = [
  "reaction",
  "monday",
  "coding",
  "cat",
  "facepalm",
  "dance",
  "celebrate",
  "awkward",
  "deal with it",
];

export function QuickChips({ className = "", onPick }: { className?: string; onPick?: () => void }) {
  const { query, setQuery } = useAppState();

  return (
    <div className={`scroll-strip gap-2 ${className}`} aria-label="quick searches">
      {CHIPS.map((chip) => {
        const on = query.trim().toLowerCase() === chip;
        return (
          <button
            key={chip}
            onClick={() => {
              setQuery(chip);
              onPick?.();
            }}
            aria-pressed={on}
            className={`shrink-0 brutal-border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 ${
              on ? "bg-acid text-bg" : "bg-surface text-fg"
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
