import { Suspense } from "react";
import { Hero } from "@/components/gallery/Hero";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { Ticker } from "@/components/chrome/Ticker";
import { memeOfTheDay } from "@/lib/memes";

const TICKER = [
  "deez nutz",
  "gottem",
  "free real estate",
  "download responsibly",
  "no login walls",
  "original art only",
  "zip the whole stash",
  "press K for the menu",
];

export default function HomePage() {
  const motd = memeOfTheDay();

  return (
    <div className="flex flex-col gap-10">
      <Hero motd={motd} />

      <Ticker items={TICKER} className="-mx-4" />

      <Suspense fallback={<GalleryFallback />}>
        <GalleryClient />
      </Suspense>
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
