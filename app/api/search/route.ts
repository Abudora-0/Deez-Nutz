import type { NextRequest } from "next/server";
import { searchGallery, type SearchScope } from "@/lib/gallery";

export const revalidate = 900;

const SCOPES: SearchScope[] = ["all", "templates", "gifs"];

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const rawScope = req.nextUrl.searchParams.get("kind") ?? "all";
  const scope: SearchScope = SCOPES.includes(rawScope as SearchScope)
    ? (rawScope as SearchScope)
    : "all";

  if (q.trim().length < 2) {
    return Response.json({ items: [] });
  }

  const items = await searchGallery(q, scope);
  return Response.json(
    { items },
    { headers: { "cache-control": "public, s-maxage=900, stale-while-revalidate=3600" } },
  );
}
