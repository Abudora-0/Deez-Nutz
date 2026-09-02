import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site";
import { resolveMeme } from "@/lib/gallery";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Deez Nutz meme";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meme = await resolveMeme(slug);

  if (!meme) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#12100f",
            color: "#c6ff3d",
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          Deez Nutz
        </div>
      ),
      size,
    );
  }

  const artSrc = meme.media.still ?? meme.media.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#12100f",
          padding: 24,
          gap: 28,
          alignItems: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img
          src={artSrc}
          width={582}
          height={582}
          alt=""
          style={{ objectFit: "contain", background: "#1b1714" }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, color: "#f5eddd" }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: "#c6ff3d", textTransform: "uppercase" }}>
            Deez Nutz
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>
            {meme.title}
          </div>
          <div style={{ fontSize: 26, color: "#b9ae98", marginTop: 16 }}>{meme.blurb}</div>
          <div style={{ fontSize: 22, color: "#f5eddd", marginTop: "auto", letterSpacing: 2 }}>
            free download at {SITE_HOST}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
