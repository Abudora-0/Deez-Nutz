"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Meme, MemeKind, SortKey } from "@/lib/types";
import { memeKind } from "@/lib/types";
import { queryMemes } from "@/lib/query";
import { stagger } from "@/lib/motion";
import { MemeCard } from "@/components/meme/MemeCard";
import { Toolbar } from "./Toolbar";
import { Slideshow } from "./Slideshow";
import { useAppState } from "@/components/providers/AppState";
import { downloadMeme, downloadPack } from "@/lib/download";
import { useFavorites } from "@/lib/favorites";

type KindFilter = "all" | MemeKind;

const KIND_TABS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "templates", label: "Templates" },
  { id: "gifs", label: "GIFs" },
  { id: "fresh", label: "Fresh" },
];

const PAGE = 30;

export function GalleryClient({ items }: { items: Meme[] }) {
  const params = useSearchParams();
  const {
    selectMode,
    selected,
    toggleSelected,
    clearSelected,
    chaos,
    chaosNonce,
    pushToast,
    query,
    setQuery,
    focusGalleryNonce,
    slideshow,
    setSlideshow,
  } = useAppState();
  const { toggle: toggleFav } = useFavorites();

  const [tags, setTags] = useState<string[]>(() => {
    const t = params.get("tag");
    return t ? [t] : [];
  });
  const [sortPref, setSortPref] = useState<SortKey>("curated");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [shown, setShown] = useState(PAGE);
  const gridRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  // hydrate the shared query from ?q= once
  useEffect(() => {
    const q = params.get("q");
    if (q) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmed = query.trim();
  const searching = trimmed.length >= 2;

  // scroll into view when the hero asks
  useEffect(() => {
    if (focusGalleryNonce > 0) {
      anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusGalleryNonce]);

  /* ------------------------------------------------------------- live search */
  const [searchResults, setSearchResults] = useState<Meme[]>([]);
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const searchScope = kindFilter === "fresh" ? "all" : kindFilter;
  const searchKey = `${searchScope}:${trimmed}`;
  const searchLoading = searching && loadingFor === searchKey;

  useEffect(() => {
    if (!searching) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoadingFor(searchKey);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&kind=${searchScope}`);
        const json = (await res.json()) as { items: Meme[] };
        if (!cancelled) setSearchResults(json.items ?? []);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setLoadingFor(null);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [trimmed, searching, searchScope, searchKey]);

  /* ------------------------------------------------------------- browse set */
  const scoped = useMemo(
    () =>
      kindFilter === "all" ? items : items.filter((m) => memeKind(m.source) === kindFilter),
    [items, kindFilter],
  );

  const sort: SortKey = chaos ? "fresh" : sortPref;
  const seed = chaos ? chaosNonce * 7919 : 1;

  const browseResults = useMemo(
    () => queryMemes(scoped, { tags, sort, seed }),
    [scoped, tags, sort, seed],
  );

  const results = searching ? searchResults : browseResults;
  const visible = results.slice(0, shown);

  // reset pagination whenever the result set changes
  const resetKey = `${kindFilter}|${tags.join(",")}|${sort}|${seed}|${searching}|${trimmed}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setShown(PAGE);
  }

  const kindCounts = useMemo(() => {
    const c: Record<KindFilter, number> = { all: items.length, templates: 0, gifs: 0, fresh: 0 };
    for (const m of items) c[memeKind(m.source)] += 1;
    return c;
  }, [items]);

  const toggleTag = useCallback(
    (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])),
    [],
  );

  /* ------------------------------------------------------------- keyboard nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (slideshow !== null) return;
      const target = e.target;
      if (target instanceof HTMLElement && target.matches("input, textarea, [contenteditable]")) return;
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
            downloadMeme(visible[cur]);
            pushToast("snagged it");
          }
          break;
        case "f":
        case "F":
          if (cur >= 0) {
            toggleFav(visible[cur]);
            pushToast("favorite toggled");
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, pushToast, toggleFav, slideshow]);

  const selectedMemes = results.filter((m) => selected.includes(m.id));
  const [packing, setPacking] = useState(false);
  const runPack = async () => {
    const list = selectedMemes.length ? selectedMemes : visible;
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
      <div ref={anchorRef} className="-mt-24 pt-24" aria-hidden />

      <div className="scroll-strip gap-2 -mx-4 px-4">
        {KIND_TABS.map((tab) => {
          const count = kindCounts[tab.id];
          if (tab.id !== "all" && count === 0) return null;
          const on = kindFilter === tab.id;
          const disabled = searching && tab.id === "fresh";
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && setKindFilter(tab.id)}
              aria-pressed={on}
              disabled={disabled}
              className={`shrink-0 brutal-border px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 disabled:opacity-30 ${
                on ? "bg-acid text-bg" : "bg-surface text-fg"
              }`}
            >
              {tab.label}
              {!searching && <span className="ml-2 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      <Toolbar
        items={scoped}
        tags={tags}
        toggleTag={toggleTag}
        clearTags={() => setTags([])}
        sort={sort}
        setSort={setSortPref}
        chaosLocked={chaos}
        searching={searching}
        resultCount={results.length}
        onSlideshow={() => visible.length && setSlideshow(0)}
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
                onClick={() => visible.forEach((m) => !selected.includes(m.id) && toggleSelected(m.id))}
                className="brutal-border bg-bg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-fg"
              >
                select shown
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
                {packing ? "zipping..." : `zip ${selected.length || visible.length}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {searchLoading && results.length === 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse brutal-border bg-surface" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="brutal-border bg-surface p-12 text-center">
          <p className="font-display text-3xl">
            {searching ? `nothing for "${trimmed}"` : "no nuts match that."}
          </p>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-fg-dim">
            {searching ? "try a shorter word, or a different tab" : "try fewer filters"}
          </p>
        </div>
      ) : (
        <>
          <motion.div
            ref={gridRef}
            variants={stagger}
            initial="hidden"
            animate="show"
            className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${chaos ? "chaos-on" : ""}`}
          >
            {visible.map((meme, i) => (
              <MemeCard key={meme.id} meme={meme} index={i} />
            ))}
          </motion.div>

          {shown < results.length && (
            <button
              onClick={() => setShown((s) => s + PAGE)}
              className="mx-auto brutal-border brutal-shadow bg-acid px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-1"
            >
              Load more ({results.length - shown} left)
            </button>
          )}
        </>
      )}

      <Slideshow items={results} />
    </div>
  );
}
