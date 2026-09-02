"use client";

import Link from "next/link";
import { AnimatedLogo } from "@/components/logo/AnimatedLogo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Odometer } from "@/components/ui/Odometer";
import { QuickChips } from "./QuickChips";
import { useDownloads } from "@/lib/stats";
import { useAppState } from "@/components/providers/AppState";

const HEAD = ["DOWNLOAD", "DEEZ", "NUTZ"];

export function Hero() {
  const downloads = useDownloads();
  const { query, setQuery, focusGallery } = useAppState();

  const jumpToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
    focusGallery();
  };

  return (
    <section className="grid gap-8 overflow-x-clip lg:grid-cols-[1.4fr_1fr] lg:items-center">
      <div className="min-w-0">
        <h1 className="hero-rise break-words font-display leading-[0.82] tracking-tight text-[2.5rem] min-[400px]:text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
          {HEAD.map((word, i) => (
            <span
              key={word}
              className={`block ${i === 1 ? "text-stroke text-bg" : ""} ${i === 2 ? "text-acid" : ""}`}
            >
              {word}
            </span>
          ))}
        </h1>

        <p className="fade-up-1 mt-5 max-w-lg text-base text-fg-dim sm:text-lg">
          Every meme template, gif, and fresh reddit post worth posting. Search it,
          caption it, grab it. No login, no watermarks, no tracking.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            jumpToGallery();
          }}
          className="mt-6 flex max-w-lg items-center gap-2 brutal-border brutal-shadow-sm bg-bg px-3 py-3 sm:px-4"
        >
          <span className="font-mono text-acid">/</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length >= 2) jumpToGallery();
            }}
            placeholder="search templates, gifs, memes..."
            aria-label="search"
            className="w-full bg-transparent font-mono text-sm text-fg outline-none placeholder:text-fg-dim sm:text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="clear"
              className="font-mono text-xs text-fg-dim hover:text-fg"
            >
              clear
            </button>
          )}
        </form>

        <QuickChips className="mt-3" onPick={jumpToGallery} />

        <div className="mt-6 flex flex-wrap gap-3">
          <MagneticButton
            onClick={jumpToGallery}
            className="brutal-border brutal-shadow bg-acid px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg"
          >
            Browse the stash
          </MagneticButton>
          <Link
            href="/create"
            className="brutal-border brutal-shadow bg-surface px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-fg transition-transform hover:-translate-y-0.5"
          >
            Make one ►
          </Link>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">
          <div>
            <dt className="sr-only">downloads</dt>
            <dd className="text-2xl text-acid">
              <Odometer value={downloads} />
            </dd>
            <span>downloads served</span>
          </div>
          <div>
            <dt className="sr-only">cost</dt>
            <dd className="text-2xl text-fg">$0</dd>
            <span>forever, no account</span>
          </div>
        </dl>
      </div>

      <div className="fade-up mx-auto hidden aspect-square w-[min(20rem,60vw)] items-center justify-center brutal-border brutal-shadow bg-surface p-8 lg:flex">
        <AnimatedLogo variant="mark" href={null} className="h-full w-full" />
      </div>
    </section>
  );
}
