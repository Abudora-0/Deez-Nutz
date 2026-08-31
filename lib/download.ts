import type { Meme } from "./types";
import { isOriginal } from "./types";
import { memeSvg } from "./art";
import { bumpDownloads } from "./stats";
import { SITE_URL } from "./site";

function triggerBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** same origin proxy that forces a download of a remote meme */
export function proxyUrl(mediaUrl: string, name: string): string {
  return `/api/download?url=${encodeURIComponent(mediaUrl)}&name=${encodeURIComponent(name)}`;
}

function triggerUrl(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ------------------------------------------------------------- originals */

export function downloadSvg(meme: Meme) {
  if (!isOriginal(meme)) return downloadMeme(meme);
  const svg = memeSvg(meme, { animated: meme.type === "gif" });
  triggerBlob(new Blob([svg], { type: "image/svg+xml" }), `deez-nutz-${meme.slug}.svg`);
  bumpDownloads(1);
}

export async function svgToPngBlob(svg: string, size = 1200): Promise<Blob> {
  const img = new Image();
  img.decoding = "sync";
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("could not rasterize meme"));
    img.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.fillStyle = "#12100f";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/png"),
  );
}

/* ------------------------------------------------------------- unified */

/** the one entry point: does the right thing for any meme source */
export async function downloadMeme(meme: Meme) {
  if (isOriginal(meme)) {
    const svg = memeSvg(meme, { animated: false });
    const blob = await svgToPngBlob(svg);
    triggerBlob(blob, `deez-nutz-${meme.slug}.png`);
    bumpDownloads(1);
    return;
  }
  if (meme.media) {
    triggerUrl(proxyUrl(meme.media.url, `deez-nutz-${meme.slug}`));
    bumpDownloads(1);
  }
}

/** kept for callers that specifically want a png of an original */
export async function downloadPng(meme: Meme) {
  return downloadMeme(meme);
}

export async function copyImageToClipboard(meme: Meme): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    let blob: Blob;
    if (isOriginal(meme)) {
      blob = await svgToPngBlob(memeSvg(meme, { animated: false }));
    } else if (meme.media && meme.type === "image") {
      const res = await fetch(proxyUrl(meme.media.url, meme.slug));
      blob = await res.blob();
    } else {
      return false; // animated gifs do not copy well
    }
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------- packs */

export async function downloadPack(
  memes: Meme[],
  onProgress?: (done: number, total: number) => void,
) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const folder = zip.folder("deez-nutz-pack");
  let done = 0;

  for (const meme of memes) {
    try {
      if (isOriginal(meme)) {
        folder?.file(`${meme.slug}.svg`, memeSvg(meme, { animated: meme.type === "gif" }));
        const png = await svgToPngBlob(memeSvg(meme, { animated: false }));
        folder?.file(`${meme.slug}.png`, png);
      } else if (meme.media) {
        const res = await fetch(proxyUrl(meme.media.url, meme.slug));
        const buf = await res.arrayBuffer();
        const ext = meme.type === "gif" ? "gif" : "jpg";
        folder?.file(`${meme.slug}.${ext}`, buf);
      }
    } catch {
      /* skip the ones that fail, keep going */
    }
    done += 1;
    onProgress?.(done, memes.length);
  }

  const credits = memes
    .filter((m) => m.media?.credit)
    .map((m) => `${m.slug}: ${m.media?.credit} (${m.media?.creditUrl})`);

  folder?.file(
    "README.txt",
    [
      "Deez Nutz meme pack",
      SITE_URL,
      "",
      "Original art is released under the MIT license.",
      "GIFs are from GIPHY and templates are from imgflip, credited below.",
      "",
      ...credits,
      "",
      "Go forth and post responsibly.",
    ].join("\n"),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  triggerBlob(blob, `deez-nutz-pack-${memes.length}.zip`);
  bumpDownloads(memes.length);
}
