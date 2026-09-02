"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import type { Meme } from "@/lib/types";
import { MemeArt } from "./MemeArt";
import { popIn } from "@/lib/motion";
import { useFavorites } from "@/lib/favorites";
import { useAppState } from "@/components/providers/AppState";
import { downloadMeme, copyImageToClipboard, copyText, shareMeme } from "@/lib/download";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface Props {
  meme: Meme;
  index: number;
}

export function MemeCard({ meme, index }: Props) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const { has, toggle } = useFavorites();
  const { selectMode, isSelected, toggleSelected, pushToast } = useAppState();
  const reduced = usePrefersReducedMotion();
  const fav = has(meme.id);
  const picked = isSelected(meme.id);

  const tilt = reduced ? {} : { rotate: index % 2 ? 0.4 : -0.4 };
  const badge = meme.source === "imgflip" ? "REMIX" : meme.type === "gif" ? "GIF" : "IMG";

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectMode) {
      e.preventDefault();
      toggleSelected(meme.id);
    }
  };

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/meme/${meme.slug}`;

  const menu: [string, () => void][] = [
    ["Download", () => { downloadMeme(meme); pushToast("snagged it"); }],
    ["Open / caption", () => router.push(`/meme/${meme.slug}`)],
    ["Copy image", async () => pushToast((await copyImageToClipboard(meme)) ? "image copied" : "cannot copy this one")],
    ["Share", async () => {
      const r = await shareMeme(meme);
      if (r === "copied") pushToast("link copied");
      else if (r === "failed") pushToast("could not share");
    }],
    ["Copy markdown", async () => pushToast((await copyText(`![${meme.title}](${meme.media.url})`)) ? "markdown copied" : "copy failed")],
    ["Copy image URL", async () => pushToast((await copyText(meme.media.url)) ? "url copied" : "copy failed")],
    [fav ? "Unfavorite" : "Favorite", () => toggle(meme)],
  ];

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.article
          variants={popIn}
          style={tilt}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          whileHover={reduced ? undefined : { y: -8, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }}
          className={`chaos-item group relative flex flex-col brutal-border bg-surface transition-shadow ${
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
            <MemeArt meme={meme} live={hover} priority={index < 4} className="h-full w-full" />

            <span className="absolute left-2 top-2 brutal-border bg-bg px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-acid">
              {badge}
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
                  toggle(meme);
                  pushToast(fav ? "unfavorited" : "favorited");
                }}
                className={`shrink-0 text-lg leading-none transition-transform hover:scale-125 ${fav ? "grayscale-0" : "grayscale"}`}
              >
                {fav ? "🥜" : "🤍"}
              </button>
            </div>
            <div className="mt-auto flex flex-wrap gap-1">
              {meme.tags.slice(0, 3).map((t) => (
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
          {menu.map(([label, fn]) => (
            <ContextMenu.Item
              key={label}
              onSelect={fn}
              className="cursor-pointer px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-fg outline-none data-[highlighted]:bg-acid data-[highlighted]:text-bg"
            >
              {label}
            </ContextMenu.Item>
          ))}
          <ContextMenu.Item asChild>
            <a
              href={link}
              onClick={(e) => { e.preventDefault(); copyText(link).then(() => pushToast("link copied")); }}
              className="block cursor-pointer px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-fg-dim outline-none data-[highlighted]:bg-acid data-[highlighted]:text-bg"
            >
              Copy share link
            </a>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
