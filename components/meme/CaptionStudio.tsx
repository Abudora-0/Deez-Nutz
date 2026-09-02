"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { proxyUrl } from "@/lib/download";
import { bumpDownloads } from "@/lib/stats";
import { useAppState } from "@/components/providers/AppState";

const IMPACT = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

export interface CaptionSource {
  /** image url, either a remote url (proxied) or a local object url */
  url: string;
  /** true when the url is same origin / a blob and needs no proxy */
  local?: boolean;
  slug: string;
  width?: number;
  height?: number;
  boxCount?: number;
  credit?: string;
  creditUrl?: string;
}

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

export function CaptionStudio({ source }: { source: CaptionSource }) {
  const { pushToast } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const ready = readyUrl === source.url;
  const boxes = Math.min(Math.max(source.boxCount ?? 2, 1), 4);
  const [captions, setCaptions] = useState<string[]>(() => Array.from({ length: boxes }, () => ""));

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const w = img.naturalWidth || source.width || 800;
    const h = img.naturalHeight || source.height || 800;
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
  }, [captions, source.width, source.height]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const url = source.url;
    img.onload = () => {
      imgRef.current = img;
      setReadyUrl(url);
    };
    img.onerror = () => pushToast("could not load that image");
    img.src = source.local ? url : proxyUrl(url, source.slug);
    return () => {
      imgRef.current = null;
    };
  }, [source.url, source.slug, source.local, pushToast]);

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
      a.download = `deez-nutz-${source.slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      bumpDownloads(1);
      pushToast("meme exported");
    }, "image/png");
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="mx-auto w-full max-w-[32rem] brutal-border brutal-shadow bg-bg-2">
        <canvas ref={canvasRef} className="block h-auto w-full" />
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">caption it</p>
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
              onChange={(e) => setCaptions((cur) => cur.map((c, j) => (j === i ? e.target.value : c)))}
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
          {ready ? "Download meme" : "loading image..."}
        </button>
        {source.credit && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">
            source via{" "}
            <a href={source.creditUrl} target="_blank" rel="noreferrer noopener" className="underline">
              {source.credit}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
