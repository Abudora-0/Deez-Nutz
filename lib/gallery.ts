import "server-only";
import type { Meme } from "./types";
import { MEMES, getMeme } from "./memes";
import { getGiphyById, getGiphyTrending, giphyEnabled } from "./sources/giphy";
import { getImgflipTemplate, getImgflipTemplates } from "./sources/imgflip";
import { getRedditMemes, getRedditPost, redditEnabled } from "./sources/reddit";

export interface GalleryData {
  items: Meme[];
  counts: {
    originals: number;
    templates: number;
    gifs: number;
    fresh: number;
  };
  enabled: { giphy: boolean; reddit: boolean };
}

/**
 * The merged gallery: hand drawn originals, imgflip templates, then the live
 * network sources. Every network source fails soft, so the page always renders.
 */
export async function loadGallery(): Promise<GalleryData> {
  const [templates, gifs, fresh] = await Promise.all([
    getImgflipTemplates(48),
    getGiphyTrending(24),
    getRedditMemes(6),
  ]);

  return {
    items: [...MEMES, ...templates, ...fresh, ...gifs],
    counts: {
      originals: MEMES.length,
      templates: templates.length,
      gifs: gifs.length,
      fresh: fresh.length,
    },
    enabled: { giphy: giphyEnabled, reddit: redditEnabled },
  };
}

/** resolve a single meme by slug across every source */
export async function resolveMeme(slug: string): Promise<Meme | null> {
  if (slug.startsWith("giphy-")) return getGiphyById(slug.slice("giphy-".length));
  if (slug.startsWith("reddit-")) return getRedditPost(slug.slice("reddit-".length));
  if (slug.startsWith("template-")) return getImgflipTemplate(slug);
  return getMeme(slug) ?? null;
}
