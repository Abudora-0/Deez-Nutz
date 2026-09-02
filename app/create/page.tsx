import type { Metadata } from "next";
import { getImgflipTemplates } from "@/lib/sources/imgflip";
import { CreateClient } from "@/components/meme/CreateClient";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Make a meme",
  description: "Caption a blank template or your own image right in the browser. No account.",
};

export default async function CreatePage() {
  const templates = (await getImgflipTemplates(24)).map((m) => ({
    slug: m.slug,
    title: m.title,
    url: m.media.url,
    width: m.media.width,
    height: m.media.height,
    boxCount: m.media.boxCount ?? 2,
    credit: m.media.credit,
    creditUrl: m.media.creditUrl,
  }));

  return (
    <div className="flex flex-col gap-6 py-4">
      <header>
        <h1 className="font-display text-5xl leading-none md:text-6xl">Make a meme</h1>
        <p className="mt-2 max-w-prose text-fg-dim">
          Pick a blank template or drop in your own image, type your lines, download the
          PNG. It never leaves your browser.
        </p>
      </header>
      <CreateClient templates={templates} />
    </div>
  );
}
