import "server-only";
import type { Meme } from "./types";
import { MEMES, getMeme } from "./memes";
import { getGiphyById, getGiphyTrending, giphyEnabled } from "./sources/giphy";
import { getImgflipTemplate, getImgflipTemplates } from "./sources/imgflip";
import { getTenorById, getTenorFeatured, tenorEnabled } from "./sources/tenor";
import { getRedditMemes, getRedditPost, redditEnabled } from "./sources/reddit";

export interface GalleryData {
  items: Meme[];
  counts: {
    originals: number;
    templates: number;
    trending: number;
    tenor: number;
    fresh: number;
  };
  enabled: { giphy: boolean; tenor: boolean; reddit: boolean };
}

/**
 * The merged gallery: hand drawn originals, imgflip templates, then the live
 * network sources. Every network source fails soft, so the page always renders.
 */
export async function loadGallery(): Promise<GalleryData> {
  const [templates, trending, tenor, fresh] = await Promise.all([
    getImgflipTemplates(48),
    getGiphyTrending(24),
    getTenorFeatured(24),
    getRedditMemes(6),
  ]);

  return {
    items: [...MEMES, ...templates, ...fresh, ...trending, ...tenor],
    counts: {
      originals: MEMES.length,
      templates: templates.length,
      trending: trending.length,
      tenor: tenor.length,
      fresh: fresh.length,
    },
    enabled: { giphy: giphyEnabled, tenor: tenorEnabled, reddit: redditEnabled },
  };
}

/** resolve a single meme by slug across every source */
export async function resolveMeme(slug: string): Promise<Meme | null> {
  if (slug.startsWith("giphy-")) return getGiphyById(slug.slice("giphy-".length));
  if (slug.startsWith("tenor-")) return getTenorById(slug.slice("tenor-".length));
  if (slug.startsWith("reddit-")) return getRedditPost(slug.slice("reddit-".length));
  if (slug.startsWith("template-")) return getImgflipTemplate(slug);
  return getMeme(slug) ?? null;
}
