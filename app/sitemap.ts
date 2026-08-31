import type { MetadataRoute } from "next";
import { MEMES } from "@/lib/memes";
import { SITE_URL as SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, priority: 1 },
    { url: `${SITE}/favorites`, lastModified: now, priority: 0.4 },
    { url: `${SITE}/about`, lastModified: now, priority: 0.5 },
    ...MEMES.map((m) => ({
      url: `${SITE}/meme/${m.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
  ];
}
