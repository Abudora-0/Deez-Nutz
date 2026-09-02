"use client";

import Link from "next/link";
import type { Meme } from "@/lib/types";
import { MemeArt } from "@/components/meme/MemeArt";

export function FeaturedStrip({ items }: { items: Meme[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Featured today">
      <div className="mb-3 flex items-center gap-3">
        <span className="brutal-border bg-hot px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-bg">
          featured today
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
          rotates at midnight utc
        </span>
      </div>
      <div className="scroll-strip gap-4 pb-2 md:grid md:grid-cols-5 md:gap-4">
        {items.map((meme) => (
          <Link
            key={meme.id}
            href={`/meme/${meme.slug}`}
            scroll={false}
            aria-label={`Open ${meme.title}`}
            className="group w-40 shrink-0 brutal-border brutal-shadow-sm bg-surface transition-transform hover:-translate-y-1 md:w-auto"
          >
            <MemeArt meme={meme} className="aspect-square w-full border-b-[3px] border-line" />
            <p className="truncate p-2 font-mono text-[10px] uppercase tracking-wider text-fg-dim">
              {meme.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
