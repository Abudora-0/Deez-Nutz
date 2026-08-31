import "server-only";
import type { Meme } from "@/lib/types";

/*
  Giphy integration. Requires GIPHY_API_KEY. Every function degrades to an empty
  result when the key is missing so the site still runs on originals alone.
*/

const KEY = process.env.GIPHY_API_KEY;
const BASE = "https://api.giphy.com/v1/gifs";
const RATING = "pg-13";

export const giphyEnabled = Boolean(KEY);

interface GiphyImage {
  url: string;
  width: string;
  height: string;
}

interface GiphyGif {
  id: string;
  title: string;
  url: string;
  username?: string;
  images: {
    original: GiphyImage;
    downsized_medium?: GiphyImage;
    fixed_width?: GiphyImage;
    original_still?: GiphyImage;
  };
}

function toMeme(g: GiphyGif): Meme | null {
  const full = g.images.downsized_medium ?? g.images.original;
  if (!full?.url) return null;
  const title = (g.title || "untitled gif").replace(/\s+GIF.*$/i, "").trim() || "untitled gif";
  return {
    id: `giphy-${g.id}`,
    slug: `giphy-${g.id}`,
    title: title.length > 60 ? `${title.slice(0, 57)}...` : title,
    type: "gif",
    tags: ["trending", "giphy", "gif"],
    blurb: g.username ? `Straight from Giphy, by ${g.username}.` : "Straight from Giphy trending.",
    source: "giphy",
    media: {
      url: full.url,
      still: g.images.original_still?.url ?? g.images.fixed_width?.url,
      width: Number(full.width) || 480,
      height: Number(full.height) || 480,
      credit: g.username ? `${g.username} via GIPHY` : "GIPHY",
      creditUrl: g.url || "https://giphy.com",
    },
  };
}

async function fetchGifs(path: string): Promise<Meme[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: GiphyGif[] };
    return (json.data ?? []).map(toMeme).filter((m): m is Meme => m !== null);
  } catch {
    return [];
  }
}

export function getGiphyTrending(limit = 24): Promise<Meme[]> {
  return fetchGifs(`trending?api_key=${KEY}&limit=${limit}&rating=${RATING}&bundle=messaging_non_clips`);
}

export function searchGiphy(query: string, limit = 24): Promise<Meme[]> {
  const q = encodeURIComponent(query.trim());
  if (!q) return Promise.resolve([]);
  return fetchGifs(`search?api_key=${KEY}&q=${q}&limit=${limit}&rating=${RATING}&lang=en`);
}

export async function getGiphyById(id: string): Promise<Meme | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(`${BASE}/${id}?api_key=${KEY}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: GiphyGif };
    return json.data ? toMeme(json.data) : null;
  } catch {
    return null;
  }
}
