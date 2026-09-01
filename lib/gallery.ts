import "server-only";
import type { Meme } from "./types";
import { MEMES, getMeme } from "./memes";
import { getGiphyById, getGiphyTrending, giphyEnabled } from "./sources/giphy";
import { getImgflipTemplate, getImgflipTemplates } from "./sources/imgflip";
import { getRedditMemes, redditEnabled } from "./sources/reddit";

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
    getRedditMemes(24),
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
  if (slug.startsWith("giphy-")) {
    const m = await getGiphyById(slug.slice("giphy-".length));
    if (m) return m;
  }
  if (slug.startsWith("template-")) {
    const m = await getImgflipTemplate(slug);
    if (m) return m;
  }
  const local = getMeme(slug);
  if (local) return local;

  // reddit items and any cache misses: pull from the merged set, which shares
  // Next's fetch cache with the gallery so this is not an extra network round trip
  const { items } = await loadGallery();
  return items.find((m) => m.slug === slug) ?? null;
}
