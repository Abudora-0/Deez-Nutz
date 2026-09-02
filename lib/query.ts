import type { Meme, SortKey } from "./types";

export function tagCount(list: Meme[], tag: string): number {
  return list.filter((m) => m.tags.includes(tag)).length;
}

export function allTags(list: Meme[]): string[] {
  return Array.from(new Set(list.flatMap((m) => m.tags))).sort();
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

/** a day key like 20260901, stable for the whole UTC day */
export function dayKey(date = new Date()): number {
  return Number(
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(
      date.getUTCDate(),
    ).padStart(2, "0")}`,
  );
}

export interface QueryArgs {
  tags?: string[];
  sort?: SortKey;
  seed?: number;
}

/** local browse filtering: tags and sort only, text search is server side now */
export function queryMemes(items: Meme[], { tags = [], sort = "curated", seed = 1 }: QueryArgs): Meme[] {
  let list = items;

  if (tags.length) {
    list = list.filter((m) => tags.every((t) => m.tags.includes(t)));
  }

  switch (sort) {
    case "az":
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return [...list].sort((a, b) => b.title.localeCompare(a.title));
    case "spicy":
      return [...list].sort(
        (a, b) => rank(b, "dankmemes") - rank(a, "dankmemes") || a.title.localeCompare(b.title),
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
