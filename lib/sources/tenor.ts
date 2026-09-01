import "server-only";
import type { Meme } from "@/lib/types";

/*
  Tenor (Google) integration. Requires TENOR_API_KEY from a Google Cloud project
  with the Tenor API enabled. Fails soft to an empty result without a key.
*/

const KEY = process.env.TENOR_API_KEY;
const BASE = "https://tenor.googleapis.com/v2";
const FILTER = "medium"; // content safety filter: off | low | medium | high

export const tenorEnabled = Boolean(KEY);

interface TenorMediaFormat {
  url: string;
  dims: [number, number];
}

interface TenorResult {
  id: string;
  content_description?: string;
  itemurl: string;
  media_formats: {
    gif?: TenorMediaFormat;
    mediumgif?: TenorMediaFormat;
    tinygif?: TenorMediaFormat;
    gifpreview?: TenorMediaFormat;
  };
}

function toMeme(r: TenorResult): Meme | null {
  const full = r.media_formats.mediumgif ?? r.media_formats.gif;
  if (!full?.url) return null;
  const title = (r.content_description || "tenor gif").trim();
  return {
    id: `tenor-${r.id}`,
    slug: `tenor-${r.id}`,
    title: title.length > 60 ? `${title.slice(0, 57)}...` : title,
    type: "gif",
    tags: ["trending", "tenor", "gif"],
    blurb: "Straight from Tenor featured.",
    source: "tenor",
    media: {
      url: full.url,
      still: r.media_formats.gifpreview?.url ?? r.media_formats.tinygif?.url,
      width: full.dims?.[0] ?? 480,
      height: full.dims?.[1] ?? 480,
      credit: "Tenor",
      creditUrl: r.itemurl || "https://tenor.com",
    },
  };
}

async function fetchTenor(path: string): Promise<Meme[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: TenorResult[] };
    return (json.results ?? []).map(toMeme).filter((m): m is Meme => m !== null);
  } catch {
    return [];
  }
}

export function getTenorFeatured(limit = 24): Promise<Meme[]> {
  return fetchTenor(
    `featured?key=${KEY}&limit=${limit}&contentfilter=${FILTER}&media_filter=mediumgif,gifpreview,tinygif`,
  );
}

export function searchTenor(query: string, limit = 24): Promise<Meme[]> {
  const q = encodeURIComponent(query.trim());
  if (!q) return Promise.resolve([]);
  return fetchTenor(
    `search?key=${KEY}&q=${q}&limit=${limit}&contentfilter=${FILTER}&media_filter=mediumgif,gifpreview,tinygif`,
  );
}

export async function getTenorById(id: string): Promise<Meme | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `${BASE}/posts?key=${KEY}&ids=${id}&media_filter=mediumgif,gifpreview,tinygif`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: TenorResult[] };
    return json.results?.[0] ? toMeme(json.results[0]) : null;
  } catch {
    return null;
  }
}
