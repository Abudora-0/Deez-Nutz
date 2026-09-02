"use client";

import Image from "next/image";
import type { Meme } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface Props {
  meme: Meme;
  /** detail view: use the full asset and let gifs animate */
  live?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const GRID_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

/**
 * Static images go through next/image (resized webp). Gifs render as a plain
 * <img> because next/image would freeze the animation. On the grid we show the
 * smaller `still` url; the detail view (`live`) shows the full asset.
 */
export function MemeArt({ meme, live = false, className = "", priority = false, sizes }: Props) {
  const reduced = usePrefersReducedMotion();
  const media = meme.media;

  if (meme.type === "gif") {
    // grids and reduced-motion get the still poster; the detail view animates
    const showStill = (!live || reduced) && !!media.still;
    return (
      <div className={`relative overflow-hidden bg-bg-2 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- animated gif, next/image would freeze it */}
        <img
          src={showStill ? media.still! : media.url}
          alt={meme.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-bg-2 ${className}`}>
      <Image
        src={media.url}
        alt={meme.title}
        fill
        sizes={sizes ?? (live ? "(max-width: 768px) 100vw, 640px" : GRID_SIZES)}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
