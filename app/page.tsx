import { Suspense } from "react";
import { Hero } from "@/components/gallery/Hero";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { Ticker } from "@/components/chrome/Ticker";
import { memeOfTheDay } from "@/lib/memes";
import { loadGallery } from "@/lib/gallery";

export const revalidate = 3600;

const TICKER = [
  "deez nutz",
  "gottem",
  "free real estate",
  "download responsibly",
  "no login walls",
  "originals plus live trending",
  "zip the whole stash",
  "press K for the menu",
];

export default async function HomePage() {
  const motd = memeOfTheDay();
  const { items, counts, enabled } = await loadGallery();

  const parts = [
    `${counts.originals} originals`,
    counts.templates > 0 && `${counts.templates} templates`,
    counts.fresh > 0 && `${counts.fresh} fresh`,
    counts.gifs > 0 && `${counts.gifs} gifs`,
  ].filter(Boolean);

  const marks = [
    enabled.giphy && "GIPHY",
    enabled.reddit && "Reddit",
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-10">
      <Hero motd={motd} />

      <Ticker items={TICKER} className="-mx-4" />

      <Suspense fallback={<GalleryFallback />}>
        <GalleryClient items={items} />
      </Suspense>

      <p className="text-center font-mono text-[11px] uppercase tracking-widest text-fg-dim">
        {parts.join(" + ")}
        {marks.length > 0 && ` · powered by ${marks.join(", ")}`}
      </p>
    </div>
  );
}

function GalleryFallback() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse brutal-border bg-surface" />
      ))}
    </div>
  );
}
