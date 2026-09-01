import "server-only";
import type { Meme } from "./types";
import { MEMES, getMeme } from "./memes";
import { getGiphyById, getGiphyTrending, giphyEnabled } from "./sources/giphy";
import { getImgflipTemplate, getImgflipTemplates } from "./sources/imgflip";

export interface GalleryData {
  items: Meme[];
  counts: { originals: number; templates: number; trending: number };
  giphyEnabled: boolean;
}

/**
 * The merged gallery: hand drawn originals first, then imgflip templates, then
 * live Giphy trending. Network sources fail soft, so the page always renders.
 */
export async function loadGallery(): Promise<GalleryData> {
  const [templates, trending] = await Promise.all([
    getImgflipTemplates(48),
    getGiphyTrending(24),
  ]);

  return {
    items: [...MEMES, ...templates, ...trending],
    counts: {
      originals: MEMES.length,
      templates: templates.length,
      trending: trending.length,
    },
    giphyEnabled,
  };
}

/** resolve a single meme by slug across every source */
export async function resolveMeme(slug: string): Promise<Meme | null> {
  if (slug.startsWith("giphy-")) {
    return getGiphyById(slug.slice("giphy-".length));
  }
  if (slug.startsWith("template-")) {
    return getImgflipTemplate(slug);
  }
  return getMeme(slug) ?? null;
}
