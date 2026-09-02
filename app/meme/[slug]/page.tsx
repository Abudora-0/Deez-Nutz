import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemeDetail } from "@/components/meme/MemeDetail";
import { resolveMeme } from "@/lib/gallery";
import { getImgflipTemplates } from "@/lib/sources/imgflip";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const templates = await getImgflipTemplates(100);
  return templates.map((m) => ({ slug: m.slug }));
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
      <MemeDetail meme={meme} />
    </article>
  );
}
