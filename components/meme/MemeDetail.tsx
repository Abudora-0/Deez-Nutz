"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Meme } from "@/lib/types";
import { MEMES } from "@/lib/memes";
import { MemeArt } from "./MemeArt";
import { DownloadButton } from "./DownloadButton";
import { useFavorites } from "@/lib/favorites";
import { useAppState } from "@/components/providers/AppState";

interface Props {
  meme: Meme;
  variant?: "page" | "modal";
}

export function MemeDetail({ meme, variant = "page" }: Props) {
  const { has, toggle } = useFavorites();
  const { pushToast } = useAppState();
  const fav = has(meme.id);

  const idx = MEMES.findIndex((m) => m.id === meme.id);
  const prev = MEMES[(idx - 1 + MEMES.length) % MEMES.length];
  const next = MEMES[(idx + 1) % MEMES.length];

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="brutal-border brutal-shadow bg-surface"
      >
        <MemeArt meme={meme} live className="aspect-square w-full" />
      </motion.div>

      <div className="flex flex-col gap-4">
        <div>
          <span className="inline-block brutal-border bg-acid px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg">
            {meme.type === "gif" ? "animated svg" : "still image"}
          </span>
          <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">{meme.title}</h1>
          <p className="mt-2 max-w-prose text-fg-dim">{meme.blurb}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {meme.tags.map((t) => (
            <Link
              key={t}
              href={`/?tag=${t}`}
              scroll={false}
              className="border-[2px] border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-fg-dim hover:bg-fg hover:text-bg"
            >
              #{t}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DownloadButton meme={meme} size="lg" />
          <button
            onClick={() => {
              toggle(meme.id);
              pushToast(fav ? "unfavorited" : "favorited");
            }}
            aria-pressed={fav}
            className="brutal-border bg-surface px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
          >
            {fav ? "🥜 saved" : "🤍 save"}
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between border-t-[3px] border-line pt-4 font-mono text-xs font-bold uppercase tracking-widest">
          <Link href={`/meme/${prev.slug}`} scroll={false} className="hover:text-acid">
            ◄ {prev.title}
          </Link>
          <Link href={`/meme/${next.slug}`} scroll={false} className="text-right hover:text-acid">
            {next.title} ►
          </Link>
        </div>

        {variant === "modal" && (
          <Link href="/" scroll={false} className="font-mono text-xs uppercase tracking-widest text-fg-dim hover:text-fg">
            back to the gallery
          </Link>
        )}
      </div>
    </div>
  );
}
