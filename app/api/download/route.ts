import type { NextRequest } from "next/server";

/*
  Streams a remote meme back to the browser with a download disposition and a
  clean filename. Only a small allowlist of hosts is proxied so this cannot be
  turned into an open relay.
*/

const ALLOWED = [
  /^([a-z0-9-]+\.)?giphy\.com$/i,
  /^i\.imgflip\.com$/i,
  /^([a-z0-9-]+\.)?redd\.it$/i,
  /^i\.imgur\.com$/i,
];

const TYPE_EXT: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") || "deez-nutz";

  if (!raw) return new Response("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED.some((re) => re.test(target.hostname))) {
    return new Response("host not allowed", { status: 403 });
  }

  const upstream = await fetch(target, {
    headers: { "user-agent": "deez-nutz/1.0 (+https://deez-nutzz.vercel.app)" },
    next: { revalidate: 86400 },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("upstream error", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const ext = TYPE_EXT[contentType.split(";")[0].trim()] ?? "bin";
  const safeName = name.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || "deez-nutz";

  return new Response(upstream.body, {
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${safeName}.${ext}"`,
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}
