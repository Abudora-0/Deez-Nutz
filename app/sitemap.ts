import type { MetadataRoute } from "next";
import { SITE_URL as SITE } from "@/lib/site";
import { getImgflipTemplates } from "@/lib/sources/imgflip";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const templates = await getImgflipTemplates(100);
  return [
    { url: SITE, lastModified: now, priority: 1 },
    { url: `${SITE}/create`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/favorites`, lastModified: now, priority: 0.3 },
    { url: `${SITE}/about`, lastModified: now, priority: 0.4 },
    ...templates.map((m) => ({
      url: `${SITE}/meme/${m.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
  ];
}
