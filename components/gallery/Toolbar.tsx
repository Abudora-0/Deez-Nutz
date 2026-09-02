"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { Meme, SortKey } from "@/lib/types";
import { allTags, tagCount } from "@/lib/query";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Odometer } from "@/components/ui/Odometer";
import { QuickChips } from "./QuickChips";
import { useAppState } from "@/components/providers/AppState";

interface Props {
  items: Meme[];
  tags: string[];
  toggleTag: (t: string) => void;
  clearTags: () => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  chaosLocked?: boolean;
  searching: boolean;
  resultCount: number;
  onSlideshow: () => void;
}

const SORTS: { value: SortKey; label: string }[] = [
  { value: "curated", label: "Curated" },
  { value: "fresh", label: "Freshly Shuffled" },
  { value: "spicy", label: "Spicy First" },
  { value: "az", label: "A to Z" },
  { value: "za", label: "Z to A" },
];

export function Toolbar(props: Props) {
  const { items, tags, toggleTag, clearTags, sort, setSort, chaosLocked, searching, resultCount, onSlideshow } =
    props;
  const { selectMode, setSelectMode, chaos, toggleChaos, query, setQuery } = useAppState();
  const tagList = useMemo(() => allTags(items), [items]);

  return (
    <div className="flex flex-col gap-4 brutal-border brutal-shadow bg-surface p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex flex-1 items-center gap-2 brutal-border bg-bg px-3 py-2">
          <span className="font-mono text-sm text-acid">/</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search templates, gifs, memes... (or press K)"
            className="w-full bg-transparent font-mono text-sm text-fg outline-none placeholder:text-fg-dim"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="clear search" className="font-mono text-xs text-fg-dim hover:text-fg">
              clear
            </button>
          )}
        </label>

        <div className="flex items-center gap-2">
          <Select
            label="sort order"
            value={chaosLocked ? "fresh" : sort}
            onValueChange={(v) => setSort(v as SortKey)}
            options={chaosLocked ? [{ value: "fresh", label: "Chaos Has The Wheel" }] : SORTS}
            className="flex-1 md:flex-none"
          />
          <button
            onClick={onSlideshow}
            aria-label="start slideshow"
            title="Slideshow"
            className="brutal-border brutal-shadow-sm bg-bg px-3 py-2 font-mono text-xs font-bold text-acid transition-transform hover:-translate-y-0.5"
          >
            ▶
          </button>
        </div>
      </div>

      <QuickChips />

      {!searching && tagList.length > 0 && (
        <div className="scroll-strip items-center gap-2 -mx-4 px-4">
          <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">tags</span>
          {tagList.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                aria-pressed={on}
                className={`shrink-0 brutal-border px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 ${
                  on ? "bg-hot text-bg" : "bg-bg text-fg"
                }`}
              >
                {t}
                <span className="ml-1 opacity-60">{tagCount(items, t)}</span>
              </button>
            );
          })}
          {tags.length > 0 && (
            <button onClick={clearTags} className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-acid underline">
              reset
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-line pt-3">
        <div className="flex flex-wrap items-center gap-5">
          <Switch checked={selectMode} onCheckedChange={setSelectMode} label="pack mode" hint="pick many, zip once" />
          <Switch checked={chaos} onCheckedChange={toggleChaos} label="chaos mode" hint="do not press this" />
        </div>
        <motion.p
          key={resultCount}
          initial={{ scale: 1.2, color: "var(--acid)" }}
          animate={{ scale: 1, color: "var(--fg)" }}
          className="font-mono text-sm font-bold uppercase tracking-widest"
        >
          <Odometer value={resultCount} /> {searching ? "found" : "in view"}
        </motion.p>
      </div>
    </div>
  );
}
