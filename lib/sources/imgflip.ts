import "server-only";
import type { Meme } from "@/lib/types";
import { slugify } from "@/lib/slug";

/*
  Imgflip provides the top meme templates with no authentication.
  We use the blank templates and let people caption them in the browser,
  so there is no account, no watermark, and no server round trip to generate.
*/

interface ImgflipTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

function toMeme(t: ImgflipTemplate): Meme {
  return {
    id: `imgflip-${t.id}`,
    slug: `template-${slugify(t.name)}-${t.id}`,
    title: t.name,
    type: "image",
    tags: ["template", "imgflip"],
    blurb: `The blank ${t.name} template. Add your own caption and download it.`,
    source: "imgflip",
    media: {
      url: t.url,
      still: t.url,
      width: t.width,
      height: t.height,
      boxCount: Math.min(Math.max(t.box_count, 1), 4),
      credit: "imgflip.com",
      creditUrl: `https://imgflip.com/memetemplate/${t.id}`,
    },
  };
}

export async function getImgflipTemplates(limit = 100): Promise<Meme[]> {
  try {
    const res = await fetch("https://api.imgflip.com/get_memes", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data?: { memes: ImgflipTemplate[] } };
    if (!json.success || !json.data) return [];
    return json.data.memes.slice(0, limit).map(toMeme);
  } catch {
    return [];
  }
}

export async function searchImgflipTemplates(query: string, limit = 40): Promise<Meme[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await getImgflipTemplates(100);
  return all.filter((m) => m.title.toLowerCase().includes(q)).slice(0, limit);
}

export async function getImgflipTemplate(slug: string): Promise<Meme | null> {
  const all = await getImgflipTemplates(100);
  return all.find((m) => m.slug === slug) ?? null;
}
