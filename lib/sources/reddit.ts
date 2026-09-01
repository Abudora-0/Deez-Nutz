import "server-only";
import type { Meme } from "@/lib/types";

/*
  Reddit integration. Pulls top image posts from an allowlist of meme subreddits.
  Requires a registered "script" app: REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET
  (create one at https://www.reddit.com/prefs/apps). Fails soft without them.

  Only SFW image posts are kept. Every item links back to and credits its thread.
*/

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const UA = "web:deez-nutz:1.1 (by /u/Abudora-0)";

const SUBREDDITS = ["memes", "dankmemes", "me_irl", "ProgrammerHumor", "wholesomememes"];
const IMAGE_RE = /\.(jpg|jpeg|png|webp)$/i;

export const redditEnabled = Boolean(CLIENT_ID && CLIENT_SECRET);

let token: { value: string; expires: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;
  if (token && token.expires > Date.now() + 60_000) return token.value;
  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
      },
      body: "grant_type=client_credentials",
      next: { revalidate: 3000 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!json.access_token) return null;
    token = {
      value: json.access_token,
      expires: Date.now() + (json.expires_in ?? 3600) * 1000,
    };
    return token.value;
  } catch {
    return null;
  }
}

interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  permalink: string;
  url: string;
  ups: number;
  over_18: boolean;
  stickied: boolean;
  is_video: boolean;
  is_gallery?: boolean;
  post_hint?: string;
  preview?: {
    images: { source: { url: string; width: number; height: number } }[];
  };
}

function toMeme(p: RedditPost): Meme | null {
  if (p.over_18 || p.stickied || p.is_video || p.is_gallery) return null;
  const isImage = p.post_hint === "image" || IMAGE_RE.test(p.url);
  if (!isImage) return null;

  const preview = p.preview?.images?.[0]?.source;
  // prefer the direct i.redd.it upload (no expiry) over a signed preview url
  const direct = IMAGE_RE.test(p.url.split("?")[0]) ? p.url : null;
  const url = (direct ?? preview?.url ?? p.url).replace(/&amp;/g, "&");
  if (!IMAGE_RE.test(url.split("?")[0])) return null;

  const title = p.title.trim();
  return {
    id: `reddit-${p.id}`,
    slug: `reddit-${p.id}`,
    title: title.length > 70 ? `${title.slice(0, 67)}...` : title,
    type: "image",
    tags: ["fresh", "reddit", p.subreddit.toLowerCase()],
    blurb: `Top of r/${p.subreddit} right now, ${p.ups.toLocaleString()} upvotes.`,
    source: "reddit",
    media: {
      url,
      still: url,
      width: preview?.width ?? 600,
      height: preview?.height ?? 600,
      credit: `r/${p.subreddit}`,
      creditUrl: `https://www.reddit.com${p.permalink}`,
    },
  };
}

async function fetchSub(sub: string, tok: string, limit: number): Promise<Meme[]> {
  try {
    const res = await fetch(
      `https://oauth.reddit.com/r/${sub}/top?t=day&limit=${limit}&raw_json=1`,
      { headers: { Authorization: `Bearer ${tok}`, "User-Agent": UA }, next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { children?: { data: RedditPost }[] } };
    return (json.data?.children ?? [])
      .map((c) => toMeme(c.data))
      .filter((m): m is Meme => m !== null);
  } catch {
    return [];
  }
}

export async function getRedditMemes(perSub = 6): Promise<Meme[]> {
  const tok = await getToken();
  if (!tok) return [];
  const batches = await Promise.all(SUBREDDITS.map((s) => fetchSub(s, tok, perSub + 4)));
  const seen = new Set<string>();
  const out: Meme[] = [];
  // round robin so the mix is not dominated by one subreddit
  for (let i = 0; i < perSub + 4; i++) {
    for (const batch of batches) {
      const m = batch[i];
      if (m && !seen.has(m.id)) {
        seen.add(m.id);
        out.push(m);
      }
    }
  }
  return out;
}

export async function getRedditPost(id: string): Promise<Meme | null> {
  const tok = await getToken();
  if (!tok) return null;
  try {
    const res = await fetch(`https://oauth.reddit.com/api/info?id=t3_${id}&raw_json=1`, {
      headers: { Authorization: `Bearer ${tok}`, "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { children?: { data: RedditPost }[] } };
    const post = json.data?.children?.[0]?.data;
    return post ? toMeme(post) : null;
  } catch {
    return null;
  }
}
