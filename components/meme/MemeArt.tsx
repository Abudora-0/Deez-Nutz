"use client";

import { useMemo } from "react";
import { memeSvg } from "@/lib/art";
import type { Meme } from "@/lib/types";
import { isOriginal } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface Props {
  meme: Meme;
  live?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Originals render as deterministic SVG. Giphy and imgflip render their real
 * hosted media. `live` turns on SMIL animation for original gifs and swaps a
 * still preview for the animated gif on hosted gifs.
 */
export function MemeArt({ meme, live = false, className = "", priority = false }: Props) {
  const reduced = usePrefersReducedMotion();

  const svg = useMemo(() => {
    if (!isOriginal(meme)) return null;
    return memeSvg(meme, { animated: live && meme.type === "gif" && !reduced });
  }, [meme, live, reduced]);

  if (svg) {
    return (
      <div
        className={`[&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`}
        // svg is generated from local, trusted data only
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  const media = meme.media;
  if (!media) return <div className={`bg-surface ${className}`} />;

  const showStill = !live && media.still && media.url !== media.still && !reduced;
  const src = showStill ? media.still! : media.url;

  return (
    <div className={`relative overflow-hidden bg-bg-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote gif that must animate, next/image would freeze it */}
      <img
        src={src}
        alt={meme.title}
        width={media.width}
        height={media.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
