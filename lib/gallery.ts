import "server-only";
import type { Meme, MemeKind } from "./types";
import { getGiphyById, getGiphyTrending, searchGiphy, giphyEnabled } from "./sources/giphy";
import {
  getImgflipTemplate,
  getImgflipTemplates,
  searchImgflipTemplates,
} from "./sources/imgflip";
import { getRedditMemes, redditEnabled } from "./sources/reddit";

export interface GalleryData {
  items: Meme[];
  counts: { templates: number; gifs: number; fresh: number };
  enabled: { giphy: boolean; reddit: boolean };
}

/**
 * The merged browse gallery: imgflip templates, Reddit fresh posts, Giphy gifs.
 * Every source fails soft, so the page always renders.
 */
export async function loadGallery(): Promise<GalleryData> {
  const [templates, fresh, gifs] = await Promise.all([
    getImgflipTemplates(100),
    getRedditMemes(50),
    getGiphyTrending(50),
  ]);

  return {
    items: [...templates, ...fresh, ...gifs],
    counts: { templates: templates.length, gifs: gifs.length, fresh: fresh.length },
    enabled: { giphy: giphyEnabled, reddit: redditEnabled },
  };
}

export type SearchScope = "all" | Exclude<MemeKind, "fresh">;

/** live typed search across the searchable sources */
export async function searchGallery(query: string, scope: SearchScope): Promise<Meme[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const jobs: Promise<Meme[]>[] = [];
  if (scope === "all" || scope === "gifs") jobs.push(searchGiphy(q, 40));
  if (scope === "all" || scope === "templates") jobs.push(searchImgflipTemplates(q, 40));

  const batches = await Promise.all(jobs);
  // interleave so a mixed scope is not front loaded by one source
  const out: Meme[] = [];
  const max = Math.max(...batches.map((b) => b.length), 0);
  for (let i = 0; i < max; i++) {
    for (const b of batches) if (b[i]) out.push(b[i]);
  }
  return out;
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
  // reddit items and any cache misses: pull from the merged set, which shares
  // Next's fetch cache with the gallery so this is not an extra network round trip
  const { items } = await loadGallery();
  return items.find((m) => m.slug === slug) ?? null;
}
