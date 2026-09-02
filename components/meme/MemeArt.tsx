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
 * Renders a meme's media inside whatever box the caller sizes via `className`
 * (usually `aspect-square w-full`). Static images use next/image (resized webp);
 * gifs use a plain absolutely positioned <img> so the animation is kept and the
 * aspect box is not stretched by an in-flow image.
 */
export function MemeArt({ meme, live = false, className = "", priority = false, sizes }: Props) {
  const reduced = usePrefersReducedMotion();
  const media = meme.media;
  // grid thumbnails crop to a clean square, the detail view shows the whole thing
  const fit = live ? "object-contain" : "object-cover";

  return (
    <div className={`relative overflow-hidden bg-bg-2 ${className}`}>
      {meme.type === "gif" ? (
        // eslint-disable-next-line @next/next/no-img-element -- animated gif, next/image would freeze it
        <img
          src={(!live || reduced) && media.still ? media.still : media.url}
          alt={meme.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 h-full w-full ${fit}`}
        />
      ) : (
        <Image
          src={media.url}
          alt={meme.title}
          fill
          sizes={sizes ?? (live ? "(max-width: 768px) 100vw, 640px" : GRID_SIZES)}
          priority={priority}
          className={fit}
        />
      )}
    </div>
  );
}
