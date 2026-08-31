"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HostedMeme } from "@/lib/types";
import { proxyUrl } from "@/lib/download";
import { bumpDownloads } from "@/lib/stats";
import { useAppState } from "@/components/providers/AppState";

const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

/** where each caption box sits, as a fraction of height */
function boxAnchors(count: number): number[] {
  if (count <= 1) return [0.5];
  if (count === 2) return [0.12, 0.88];
  if (count === 3) return [0.1, 0.5, 0.9];
  return [0.1, 0.37, 0.63, 0.9];
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
  fontSize: number,
) {
  ctx.font = `${fontSize}px ${IMPACT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(3, fontSize / 12);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";

  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const lh = fontSize * 1.05;
  const startY = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => {
    const y = startY + i * lh;
    ctx.strokeText(ln, cx, y);
    ctx.fillText(ln, cx, y);
  });
}

export function CaptionStudio({ meme }: { meme: HostedMeme }) {
  const { pushToast } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const boxes = meme.media.boxCount ?? 2;
  const [captions, setCaptions] = useState<string[]>(() =>
    Array.from({ length: boxes }, (_, i) => (i === 0 ? "" : "")),
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const w = img.naturalWidth || meme.media.width;
    const h = img.naturalHeight || meme.media.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);

    const anchors = boxAnchors(captions.length);
    const fontSize = Math.round(h / 10);
    captions.forEach((text, i) => {
      if (!text.trim()) return;
      drawWrapped(ctx, text, w / 2, anchors[i] * h, w * 0.92, fontSize);
    });
  }, [captions, meme.media.width, meme.media.height]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.onerror = () => pushToast("could not load the template");
    img.src = proxyUrl(meme.media.url, meme.slug);
    return () => {
      imgRef.current = null;
    };
  }, [meme.media.url, meme.slug, pushToast]);

  useEffect(() => {
    if (ready) render();
  }, [ready, render]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        pushToast("export failed");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deez-nutz-${meme.slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      bumpDownloads(1);
      pushToast("meme exported");
    }, "image/png");
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
      <div className="brutal-border brutal-shadow bg-bg-2">
        <canvas ref={canvasRef} className="h-auto w-full" />
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">
          caption it
        </p>
        {captions.map((value, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-fg-dim">
              {captions.length === 1
                ? "text"
                : i === 0
                  ? "top text"
                  : i === captions.length - 1
                    ? "bottom text"
                    : `text ${i + 1}`}
            </span>
            <input
              value={value}
              onChange={(e) =>
                setCaptions((cur) => cur.map((c, j) => (j === i ? e.target.value : c)))
              }
              placeholder="type here"
              className="brutal-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none placeholder:text-fg-dim"
            />
          </label>
        ))}
        <button
          onClick={download}
          disabled={!ready}
          className="brutal-border brutal-shadow-sm bg-acid px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {ready ? "Download meme" : "loading template..."}
        </button>
        <p className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">
          template via{" "}
          <a href={meme.media.creditUrl} target="_blank" rel="noreferrer noopener" className="underline">
            {meme.media.credit}
          </a>
        </p>
      </div>
    </div>
  );
}
