"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { SortKey } from "@/lib/types";
import { queryMemes } from "@/lib/memes";
import { stagger } from "@/lib/motion";
import { MemeCard } from "@/components/meme/MemeCard";
import { Toolbar } from "./Toolbar";
import { useAppState } from "@/components/providers/AppState";
import { downloadPng, downloadPack } from "@/lib/download";
import { useFavorites } from "@/lib/favorites";

export function GalleryClient() {
  const params = useSearchParams();
  const { selectMode, selected, toggleSelected, clearSelected, chaos, chaosNonce, pushToast } =
    useAppState();
  const { toggle: toggleFav } = useFavorites();

  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [tags, setTags] = useState<string[]>(() => {
    const t = params.get("tag");
    return t ? [t] : [];
  });
  const [sortPref, setSortPref] = useState<SortKey>("curated");
  const gridRef = useRef<HTMLDivElement>(null);

  // chaos overrides the sort and forces a fresh shuffle seed
  const sort: SortKey = chaos ? "fresh" : sortPref;
  const seed = chaos ? chaosNonce * 7919 : 1;

  const results = useMemo(
    () => queryMemes({ query, tags, sort, seed }),
    [query, tags, sort, seed],
  );

  const toggleTag = useCallback(
    (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])),
    [],
  );

  // keyboard nav across the grid
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.matches("input, textarea")) return;
      const cards = Array.from(
        gridRef.current?.querySelectorAll<HTMLElement>("[data-meme-card]") ?? [],
      );
      if (!cards.length) return;
      const active = document.activeElement as HTMLElement;
      const cur = cards.findIndex((c) => c.contains(active));
      const cols = Math.max(1, Math.round((gridRef.current?.clientWidth ?? 1) / 320));

      const focusCard = (i: number) => {
        const c = cards[(i + cards.length) % cards.length];
        (c.querySelector("a") as HTMLElement | null)?.focus();
        c.scrollIntoView({ block: "nearest" });
      };

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          focusCard(cur < 0 ? 0 : cur + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          focusCard(cur < 0 ? 0 : cur - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          focusCard(cur < 0 ? 0 : cur + cols);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusCard(cur < 0 ? 0 : cur - cols);
          break;
        case "d":
        case "D":
          if (cur >= 0) {
            downloadPng(results[cur]).then(() => pushToast("snagged it"));
          }
          break;
        case "f":
        case "F":
          if (cur >= 0) {
            toggleFav(results[cur].id);
            pushToast("favorite toggled");
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, pushToast, toggleFav]);

  const selectedMemes = results.filter((m) => selected.includes(m.id));
  const [packing, setPacking] = useState(false);

  const runPack = async () => {
    const list = selectedMemes.length ? selectedMemes : results;
    setPacking(true);
    pushToast(`zipping ${list.length}...`);
    try {
      await downloadPack(list);
      pushToast("pack delivered");
    } catch {
      pushToast("pack failed");
    } finally {
      setPacking(false);
    }
  };

  return (
    <div id="gallery" className="flex flex-col gap-6">
      <Toolbar
        query={query}
        setQuery={setQuery}
        tags={tags}
        toggleTag={toggleTag}
        clearTags={() => setTags([])}
        sort={sort}
        setSort={setSortPref}
        chaosLocked={chaos}
        resultCount={results.length}
      />

      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="sticky top-3 z-30 flex flex-wrap items-center justify-between gap-3 brutal-border bg-hot p-3 text-bg shadow-[6px_6px_0_0_var(--line)]"
          >
            <span className="font-mono text-sm font-bold uppercase tracking-widest">
              {selected.length} picked
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => results.forEach((m) => !selected.includes(m.id) && toggleSelected(m.id))}
                className="brutal-border bg-bg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-fg"
              >
                select all
              </button>
              <button
                onClick={clearSelected}
                className="brutal-border bg-bg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-fg"
              >
                clear
              </button>
              <button
                onClick={runPack}
                disabled={packing}
                className="brutal-border bg-acid px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-bg disabled:opacity-60"
              >
                {packing ? "zipping..." : `zip ${selected.length || results.length}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 ? (
        <div className="brutal-border bg-surface p-12 text-center">
          <p className="font-display text-3xl">no nuts match that.</p>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-fg-dim">
            try fewer filters, or embrace the chaos button
          </p>
        </div>
      ) : (
        <motion.div
          ref={gridRef}
          variants={stagger}
          initial="hidden"
          animate="show"
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${chaos ? "chaos-on" : ""}`}
        >
          {results.map((meme, i) => (
            <MemeCard key={meme.id} meme={meme} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
