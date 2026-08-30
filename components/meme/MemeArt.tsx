"use client";

import { useMemo } from "react";
import { memeSvg } from "@/lib/art";
import type { Meme } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface Props {
  meme: Meme;
  live?: boolean;
  className?: string;
}

/**
 * Renders the deterministic SVG for a meme. `live` turns on SMIL animation for
 * gif type memes (used on hover and on the detail view) so grids stay cheap.
 */
export function MemeArt({ meme, live = false, className = "" }: Props) {
  const reduced = usePrefersReducedMotion();
  const animated = live && meme.type === "gif" && !reduced;
  const html = useMemo(
    () => memeSvg(meme, { animated }),
    [meme, animated],
  );
  return (
    <div
      className={`[&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`}
      // svg is generated from local, trusted data only
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
