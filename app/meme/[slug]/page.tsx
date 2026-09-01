import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemeDetail } from "@/components/meme/MemeDetail";
import { MEMES } from "@/lib/memes";
import { resolveMeme } from "@/lib/gallery";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return MEMES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meme = await resolveMeme(slug);
  if (!meme) return { title: "Not found" };
  return {
    title: meme.title,
    description: meme.blurb,
    alternates: { canonical: `/meme/${meme.slug}` },
    openGraph: {
      title: meme.title,
      description: meme.blurb,
      url: `/meme/${meme.slug}`,
      images: [{ url: `/meme/${meme.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function MemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meme = await resolveMeme(slug);
  if (!meme) notFound();

  return (
    <article className="py-4">
      <Link
        href="/"
        className="mb-6 inline-block font-mono text-xs font-bold uppercase tracking-widest text-fg-dim hover:text-acid"
      >
        ◄ back to the arcade
      </Link>
      <MemeDetail meme={meme} variant="page" />
    </article>
  );
}
