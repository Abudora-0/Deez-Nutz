import type { Meme } from "./types";
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

export function downloadSvg(meme: Meme) {
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

export async function downloadPng(meme: Meme) {
  const svg = memeSvg(meme, { animated: false });
  const blob = await svgToPngBlob(svg);
  triggerBlob(blob, `deez-nutz-${meme.slug}.png`);
  bumpDownloads(1);
}

export async function copyPngToClipboard(meme: Meme): Promise<boolean> {
  try {
    const svg = memeSvg(meme, { animated: false });
    const blob = await svgToPngBlob(svg);
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function downloadPack(memes: Meme[], onProgress?: (done: number, total: number) => void) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const folder = zip.folder("deez-nutz-pack");
  let done = 0;
  for (const meme of memes) {
    const svg = memeSvg(meme, { animated: meme.type === "gif" });
    folder?.file(`${meme.slug}.svg`, svg);
    try {
      const png = await svgToPngBlob(memeSvg(meme, { animated: false }));
      folder?.file(`${meme.slug}.png`, png);
    } catch {
      /* svg still included */
    }
    done += 1;
    onProgress?.(done, memes.length);
  }
  folder?.file(
    "README.txt",
    [
      "Deez Nutz meme pack",
      SITE_URL,
      "",
      "All art in this pack is original and released under the MIT license.",
      "Go forth and post responsibly.",
    ].join("\n"),
  );
  const blob = await zip.generateAsync({ type: "blob" });
  triggerBlob(blob, `deez-nutz-pack-${memes.length}.zip`);
  bumpDownloads(memes.length);
}
