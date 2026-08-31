"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Meme } from "@/lib/types";
import { isOriginal, isHosted } from "@/lib/types";
import { MEMES } from "@/lib/memes";
import { MemeArt } from "./MemeArt";
import { DownloadButton } from "./DownloadButton";
import { CaptionStudio } from "./CaptionStudio";
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
  const isTemplate = meme.source === "imgflip";

  // prev / next only cycles the originals
  const idx = MEMES.findIndex((m) => m.id === meme.id);
  const prev = idx >= 0 ? MEMES[(idx - 1 + MEMES.length) % MEMES.length] : null;
  const next = idx >= 0 ? MEMES[(idx + 1) % MEMES.length] : null;

  const kindLabel = isOriginal(meme)
    ? meme.type === "gif"
      ? "animated svg"
      : "still image"
    : isTemplate
      ? "caption template"
      : "gif via giphy";

  return (
    <div className="flex flex-col gap-6">
      {isTemplate && isHosted(meme) ? (
        <>
          <header>
            <span className="inline-block brutal-border bg-acid px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg">
              {kindLabel}
            </span>
            <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">{meme.title}</h1>
            <p className="mt-2 max-w-prose text-fg-dim">{meme.blurb}</p>
          </header>
          <CaptionStudio meme={meme} />
          <TagRow meme={meme} />
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="brutal-border brutal-shadow bg-surface"
          >
            <MemeArt meme={meme} live priority className="aspect-square w-full" />
          </motion.div>

          <div className="flex flex-col gap-4">
            <div>
              <span className="inline-block brutal-border bg-acid px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg">
                {kindLabel}
              </span>
              <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">{meme.title}</h1>
              <p className="mt-2 max-w-prose text-fg-dim">{meme.blurb}</p>
              {isHosted(meme) && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-fg-dim">
                  via{" "}
                  <a
                    href={meme.media.creditUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline hover:text-acid"
                  >
                    {meme.media.credit}
                  </a>
                </p>
              )}
            </div>

            <TagRow meme={meme} />

            <div className="flex flex-wrap items-center gap-3">
              <DownloadButton meme={meme} size="lg" />
              <button
                onClick={() => {
                  toggle(meme);
                  pushToast(fav ? "unfavorited" : "favorited");
                }}
                aria-pressed={fav}
                className="brutal-border bg-surface px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
              >
                {fav ? "🥜 saved" : "🤍 save"}
              </button>
            </div>

            {prev && next && (
              <div className="mt-auto flex items-center justify-between border-t-[3px] border-line pt-4 font-mono text-xs font-bold uppercase tracking-widest">
                <Link href={`/meme/${prev.slug}`} scroll={false} className="hover:text-acid">
                  ◄ {prev.title}
                </Link>
                <Link href={`/meme/${next.slug}`} scroll={false} className="text-right hover:text-acid">
                  {next.title} ►
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {variant === "modal" && (
        <Link href="/" scroll={false} className="font-mono text-xs uppercase tracking-widest text-fg-dim hover:text-fg">
          back to the gallery
        </Link>
      )}
    </div>
  );
}

function TagRow({ meme }: { meme: Meme }) {
  return (
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
  );
}
