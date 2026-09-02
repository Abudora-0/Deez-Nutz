import type { Meme } from "./types";
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

/** the one entry point: streams the media through the download proxy */
export function downloadMeme(meme: Meme) {
  triggerUrl(proxyUrl(meme.media.url, `deez-nutz-${meme.slug}`));
  bumpDownloads(1);
}

export async function copyImageToClipboard(meme: Meme): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    if (meme.type !== "image") return false; // animated gifs do not copy well
    const res = await fetch(proxyUrl(meme.media.url, meme.slug));
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareMeme(meme: Meme): Promise<"shared" | "copied" | "failed"> {
  const url = `${window.location.origin}/meme/${meme.slug}`;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: meme.title, url });
      return "shared";
    } catch {
      /* user cancelled or share failed, fall through to copy */
    }
  }
  return (await copyText(url)) ? "copied" : "failed";
}

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
      const res = await fetch(proxyUrl(meme.media.url, meme.slug));
      const buf = await res.arrayBuffer();
      const ext = meme.type === "gif" ? "gif" : "jpg";
      folder?.file(`${meme.slug}.${ext}`, buf);
    } catch {
      /* skip the ones that fail, keep going */
    }
    done += 1;
    onProgress?.(done, memes.length);
  }

  const credits = memes.map((m) => `${m.slug}: ${m.media.credit} (${m.media.creditUrl})`);

  folder?.file(
    "README.txt",
    [
      "Deez Nutz meme pack",
      SITE_URL,
      "",
      "Every file here is fetched live from a public API and credited below.",
      "This project does not host or claim ownership of it.",
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
