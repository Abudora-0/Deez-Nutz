import { loadGallery } from "@/lib/gallery";
import { seededShuffle, dayKey } from "@/lib/query";
import { GalleryClient } from "./GalleryClient";
import { FeaturedStrip } from "./FeaturedStrip";

export async function GallerySection() {
  const { items, counts, enabled } = await loadGallery();
  const featured = seededShuffle(items, dayKey()).slice(0, 10);

  const parts = [
    counts.templates > 0 && `${counts.templates} templates`,
    counts.fresh > 0 && `${counts.fresh} fresh`,
    counts.gifs > 0 && `${counts.gifs} gifs`,
  ].filter(Boolean);

  const marks = [enabled.giphy && "GIPHY", enabled.reddit && "Reddit"].filter(Boolean);

  return (
    <div className="flex flex-col gap-10">
      <FeaturedStrip items={featured} />
      <GalleryClient items={items} />
      <p className="text-center font-mono text-[11px] uppercase tracking-widest text-fg-dim">
        {parts.join(" + ")}
        {marks.length > 0 && ` · powered by ${marks.join(", ")}`}
      </p>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-10 w-full max-w-md animate-pulse brutal-border bg-surface" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse brutal-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
