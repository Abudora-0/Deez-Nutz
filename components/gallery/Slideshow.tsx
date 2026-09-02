"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Meme } from "@/lib/types";
import { MemeArt } from "@/components/meme/MemeArt";
import { downloadMeme } from "@/lib/download";
import { useAppState } from "@/components/providers/AppState";

export function Slideshow({ items }: { items: Meme[] }) {
  const { slideshow, setSlideshow, pushToast } = useAppState();
  const [auto, setAuto] = useState(false);
  const open = slideshow !== null && items.length > 0;
  const idx = slideshow ?? 0;
  const meme = items[Math.min(idx, Math.max(items.length - 1, 0))];

  const close = useCallback(() => {
    setSlideshow(null);
    setAuto(false);
  }, [setSlideshow]);

  const go = useCallback(
    (delta: number) => {
      if (!items.length) return;
      setSlideshow(((slideshow ?? 0) + delta + items.length) % items.length);
    },
    [slideshow, items.length, setSlideshow],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setAuto((a) => !a);
      } else if (e.key.toLowerCase() === "d" && meme) {
        downloadMeme(meme);
        pushToast("snagged it");
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, close, meme, pushToast]);

  useEffect(() => {
    if (!open || !auto) return;
    const t = setInterval(() => go(1), 4000);
    return () => clearInterval(t);
  }, [open, auto, go]);

  if (!open || !meme) return null;

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-bg/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b-[3px] border-line p-3">
        <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">
          {idx + 1} / {items.length}
        </span>
        <span className="min-w-0 truncate px-2 font-display text-lg">{meme.title}</span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setAuto((a) => !a)}
            className={`brutal-border px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-widest ${
              auto ? "bg-acid text-bg" : "bg-surface text-fg"
            }`}
          >
            {auto ? "playing" : "auto"}
          </button>
          <button
            onClick={close}
            aria-label="close slideshow"
            className="brutal-border bg-hot px-3 py-1 font-display text-bg transition-transform hover:rotate-90"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        <button
          onClick={() => go(-1)}
          aria-label="previous"
          className="absolute left-0 top-0 z-10 flex h-full w-1/5 items-center pl-3 text-fg-dim/40 transition-colors hover:text-fg"
        >
          <span className="brutal-border bg-surface px-3 py-2 font-display text-xl">◄</span>
        </button>
        <button
          onClick={() => go(1)}
          aria-label="next"
          className="absolute right-0 top-0 z-10 flex h-full w-1/5 items-center justify-end pr-3 text-fg-dim/40 transition-colors hover:text-fg"
        >
          <span className="brutal-border bg-surface px-3 py-2 font-display text-xl">►</span>
        </button>

        <div className="h-full max-h-[70vh] w-full max-w-3xl brutal-border brutal-shadow bg-surface">
          <Link href={`/meme/${meme.slug}`} scroll={false} onClick={close} className="block h-full w-full">
            <MemeArt meme={meme} live className="h-full w-full" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 border-t-[3px] border-line p-3">
        <button
          onClick={() => {
            downloadMeme(meme);
            pushToast("snagged it");
          }}
          className="brutal-border brutal-shadow-sm bg-acid px-5 py-2 font-mono text-sm font-bold uppercase tracking-widest text-bg"
        >
          Download
        </button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-dim">
          arrows to move · space to auto · d to grab · esc to close
        </span>
      </div>
    </div>
  );
}
