"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Meme } from "@/lib/types";
import { MEMES, ALL_TAGS, seededShuffle, memeOfTheDay } from "@/lib/memes";
import { MemeArt } from "@/components/meme/MemeArt";
import { DownloadButton } from "@/components/meme/DownloadButton";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Odometer } from "@/components/ui/Odometer";
import { useDownloads } from "@/lib/stats";
import { useMounted } from "@/lib/hooks";
import { slamIn } from "@/lib/motion";

const HEAD = ["DOWNLOAD", "DEEZ", "NUTZ"];

export function Hero({ motd: initialMotd }: { motd: Meme }) {
  const router = useRouter();
  const downloads = useDownloads();
  const mounted = useMounted();
  // recompute against the viewer's clock once mounted so "resets at midnight" is honest
  const motd = mounted ? memeOfTheDay() : initialMotd;

  const randomMeme = () => {
    const pick = seededShuffle(MEMES, Date.now())[0];
    router.push(`/meme/${pick.slug}`);
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
      <div>
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="font-display text-6xl leading-[0.85] tracking-tight sm:text-7xl md:text-8xl"
        >
          {HEAD.map((word, i) => (
            <motion.span
              key={word}
              variants={slamIn}
              className={`block ${i === 1 ? "text-stroke text-bg" : ""} ${i === 2 ? "text-acid" : ""}`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 max-w-lg text-lg text-fg-dim"
        >
          A neo brutalist arcade of original meme art. No watermarked reposts, no login walls,
          no tracking pixels. Just pick one, hit download, and go cause problems.
        </motion.p>

        <div className="mt-6 flex flex-wrap gap-3">
          <MagneticButton
            onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
            className="brutal-border brutal-shadow bg-acid px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg"
          >
            Enter the gallery
          </MagneticButton>
          <MagneticButton
            onClick={randomMeme}
            className="brutal-border brutal-shadow bg-surface px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-fg"
          >
            Random nut ⚄
          </MagneticButton>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">
          <div>
            <dt className="sr-only">memes</dt>
            <dd className="text-2xl text-fg"><Odometer value={MEMES.length} /></dd>
            <span>certified nuts</span>
          </div>
          <div>
            <dt className="sr-only">tags</dt>
            <dd className="text-2xl text-fg"><Odometer value={ALL_TAGS.length} /></dd>
            <span>categories</span>
          </div>
          <div>
            <dt className="sr-only">downloads</dt>
            <dd className="text-2xl text-acid"><Odometer value={downloads} /></dd>
            <span>downloads served</span>
          </div>
        </dl>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 40, rotate: 3 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 20, delay: 0.2 }}
        className="relative"
      >
        <span className="absolute -left-3 -top-3 z-10 brutal-border bg-hot px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-bg">
          nut of the day
        </span>
        <div className="brutal-border brutal-shadow bg-surface">
          <Link
            href={`/meme/${motd.slug}`}
            scroll={false}
            aria-label={`Open ${motd.title}`}
            className="block border-b-[3px] border-line"
          >
            <MemeArt meme={motd} live className="aspect-square w-full" />
          </Link>
          <div className="flex items-center justify-between gap-3 p-3">
            <div>
              <p className="font-display text-xl leading-none">{motd.title}</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
                resets at midnight utc
              </p>
            </div>
            <DownloadButton meme={motd} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
