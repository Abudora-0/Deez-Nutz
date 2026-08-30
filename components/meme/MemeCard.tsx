"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import type { Meme } from "@/lib/types";
import { MemeArt } from "./MemeArt";
import { popIn } from "@/lib/motion";
import { useFavorites } from "@/lib/favorites";
import { useAppState } from "@/components/providers/AppState";
import { downloadPng, downloadSvg, copyPngToClipboard } from "@/lib/download";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface Props {
  meme: Meme;
  index: number;
}

export function MemeCard({ meme, index }: Props) {
  const [hover, setHover] = useState(false);
  const { has, toggle } = useFavorites();
  const { selectMode, isSelected, toggleSelected, pushToast } = useAppState();
  const reduced = usePrefersReducedMotion();
  const fav = has(meme.id);
  const picked = isSelected(meme.id);

  const tilt = reduced ? {} : { rotate: index % 2 ? 0.4 : -0.4 };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectMode) {
      e.preventDefault();
      toggleSelected(meme.id);
    }
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.article
          variants={popIn}
          style={tilt}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          whileHover={reduced ? undefined : { y: -8, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }}
          className={`cv-auto chaos-item group relative flex flex-col brutal-border bg-surface transition-shadow ${
            picked ? "shadow-[8px_8px_0_0_var(--hot)]" : "brutal-shadow hover:shadow-[10px_10px_0_0_var(--acid)]"
          }`}
          data-meme-card
          data-index={index}
        >
          <Link
            href={`/meme/${meme.slug}`}
            scroll={false}
            onClick={handleCardClick}
            className="relative block aspect-square overflow-hidden border-b-[3px] border-line"
            aria-label={`Open ${meme.title}`}
          >
            <MemeArt meme={meme} live={hover} className="h-full w-full" />

            <span className="absolute left-2 top-2 brutal-border bg-bg px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-acid">
              {meme.type === "gif" ? "GIF" : "IMG"}
            </span>

            {selectMode && (
              <span
                className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center brutal-border font-mono text-sm font-bold ${
                  picked ? "bg-hot text-bg" : "bg-bg text-fg"
                }`}
              >
                {picked ? "✓" : ""}
              </span>
            )}
          </Link>

          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg leading-none">{meme.title}</h3>
              <button
                aria-label={fav ? "remove from favorites" : "add to favorites"}
                aria-pressed={fav}
                onClick={() => {
                  toggle(meme.id);
                  pushToast(fav ? "unfavorited" : "favorited");
                }}
                className={`shrink-0 text-lg leading-none transition-transform hover:scale-125 ${
                  fav ? "grayscale-0" : "grayscale"
                }`}
              >
                {fav ? "🥜" : "🤍"}
              </button>
            </div>
            <div className="mt-auto flex flex-wrap gap-1">
              {meme.tags.map((t) => (
                <span
                  key={t}
                  className="border-[2px] border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-dim"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.article>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="anim-pop z-[90] w-52 brutal-border bg-surface shadow-[6px_6px_0_0_var(--line)]">
          {[
            ["Download PNG", () => downloadPng(meme).then(() => pushToast("snagged the png"))],
            ["Download SVG", () => { downloadSvg(meme); pushToast("snagged the svg"); }],
            ["Copy image", async () => pushToast((await copyPngToClipboard(meme)) ? "image copied" : "clipboard blocked")],
            ["Copy share link", async () => {
              await navigator.clipboard.writeText(`${window.location.origin}/meme/${meme.slug}`);
              pushToast("link copied");
            }],
            [fav ? "Unfavorite" : "Favorite", () => toggle(meme.id)],
          ].map(([label, fn]) => (
            <ContextMenu.Item
              key={label as string}
              onSelect={fn as () => void}
              className="cursor-pointer px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-fg outline-none data-[highlighted]:bg-acid data-[highlighted]:text-bg"
            >
              {label as string}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
