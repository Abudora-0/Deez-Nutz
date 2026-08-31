import raw from "@/data/memes.json";
import type { Meme, SortKey } from "./types";

/** the hand drawn originals, always available, no network */
export const MEMES: Meme[] = (raw as Omit<Meme, "source">[]).map((m) => ({
  ...m,
  source: "original" as const,
}));

export const ORIGINAL_TAGS: string[] = Array.from(
  new Set(MEMES.flatMap((m) => m.tags)),
).sort();

export function getMeme(slug: string): Meme | undefined {
  return MEMES.find((m) => m.slug === slug);
}

export function tagCount(list: Meme[], tag: string): number {
  return list.filter((m) => m.tags.includes(tag)).length;
}

export function allTags(list: Meme[]): string[] {
  return Array.from(new Set(list.flatMap((m) => m.tags))).sort();
}

/** deterministic pick from the originals that changes once per day */
export function memeOfTheDay(date = new Date()): Meme {
  const key = Number(
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(
      date.getUTCDate(),
    ).padStart(2, "0")}`,
  );
  return MEMES[key % MEMES.length];
}

/** deterministic shuffle from a numeric seed, does not mutate input */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface QueryArgs {
  query?: string;
  tags?: string[];
  sort?: SortKey;
  seed?: number;
}

export function queryMemes(
  items: Meme[],
  { query = "", tags = [], sort = "curated", seed = 1 }: QueryArgs,
): Meme[] {
  let list = items;

  if (tags.length) {
    list = list.filter((m) => tags.every((t) => m.tags.includes(t)));
  }

  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.blurb.toLowerCase().includes(q) ||
        m.tags.some((t) => t.includes(q)) ||
        (m.spec?.lines.join(" ").toLowerCase().includes(q) ?? false),
    );
  }

  switch (sort) {
    case "az":
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return [...list].sort((a, b) => b.title.localeCompare(a.title));
    case "spicy":
      return [...list].sort(
        (a, b) => rank(b, "savage") - rank(a, "savage") || a.title.localeCompare(b.title),
      );
    case "fresh":
      return seededShuffle(list, seed);
    default:
      return list;
  }
}

function rank(m: Meme, tag: string): number {
  return m.tags.includes(tag) ? 1 : 0;
}
