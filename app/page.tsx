import { Suspense } from "react";
import { Hero } from "@/components/gallery/Hero";
import { Ticker } from "@/components/chrome/Ticker";
import { GallerySection, GallerySkeleton } from "@/components/gallery/GallerySection";

export const revalidate = 3600;

const TICKER = [
  "deez nutz",
  "gottem",
  "search it, caption it, grab it",
  "no login walls",
  "no watermarks",
  "templates + gifs + fresh reddit",
  "zip the whole stash",
  "press K for the menu",
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <Hero />
      <Ticker items={TICKER} className="-mx-4" />
      <Suspense fallback={<GallerySkeleton />}>
        <GallerySection />
      </Suspense>
    </div>
  );
}
