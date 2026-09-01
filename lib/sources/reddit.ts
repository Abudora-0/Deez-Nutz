import "server-only";
import type { Meme } from "@/lib/types";

/*
  Reddit content via meme-api.com, a free public proxy over an allowlist of meme
  subreddits (https://github.com/D3vd/Meme_Api). No registration, no key, no OAuth
  wall. It fails soft like every other source, so losing it costs nothing.

  Every item still credits and links back to its original Reddit thread.
*/

const SUBREDDITS = "memes+dankmemes+me_irl+ProgrammerHumor+wholesomememes";
const IMAGE_RE = /\.(jpg|jpeg|png|webp|gif)$/i;

export const redditEnabled = true;

interface ApiPost {
  postLink: string;
  subreddit: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  author: string;
  ups: number;
  preview?: string[];
}

function toMeme(p: ApiPost): Meme | null {
  if (p.nsfw || p.spoiler) return null;
  if (!IMAGE_RE.test(p.url.split("?")[0])) return null;

  const idMatch = p.postLink.match(/comments\/([a-z0-9]+)/i) ?? p.postLink.match(/redd\.it\/([a-z0-9]+)/i);
  const id = idMatch?.[1];
  if (!id) return null;

  const title = p.title.trim();
  return {
    id: `reddit-${id}`,
    slug: `reddit-${id}`,
    title: title.length > 70 ? `${title.slice(0, 67)}...` : title,
    type: p.url.toLowerCase().endsWith(".gif") ? "gif" : "image",
    tags: ["fresh", "reddit", p.subreddit.toLowerCase()],
    blurb: `Top of r/${p.subreddit} right now, ${p.ups.toLocaleString()} upvotes.`,
    source: "reddit",
    media: {
      url: p.url,
      still: p.preview?.[p.preview.length - 1] ?? p.url,
      width: 640,
      height: 640,
      credit: `r/${p.subreddit}`,
      creditUrl: p.postLink,
    },
  };
}

export async function getRedditMemes(count = 24): Promise<Meme[]> {
  try {
    const res = await fetch(`https://meme-api.com/gimme/${SUBREDDITS}/${count}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { memes?: ApiPost[] };
    return (json.memes ?? []).map(toMeme).filter((m): m is Meme => m !== null);
  } catch {
    return [];
  }
}
