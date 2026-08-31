"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useFavorites } from "@/lib/favorites";
import { MemeCard } from "@/components/meme/MemeCard";
import { stagger } from "@/lib/motion";
import { downloadPack } from "@/lib/download";
import { useAppState } from "@/components/providers/AppState";
import { useState } from "react";

export function FavoritesClient() {
  const { items: stash, ready, clear } = useFavorites();
  const { pushToast } = useAppState();
  const [packing, setPacking] = useState(false);

  const zipStash = async () => {
    setPacking(true);
    pushToast(`zipping ${stash.length}...`);
    try {
      await downloadPack(stash);
      pushToast("stash delivered");
    } catch {
      pushToast("zip failed");
    } finally {
      setPacking(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-line pb-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Your Stash</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-fg-dim">
            {ready ? `${stash.length} memes hoarded on this device` : "loading your stash..."}
          </p>
        </div>
        {stash.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={zipStash}
              disabled={packing}
              className="brutal-border brutal-shadow-sm bg-acid px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-bg disabled:opacity-60"
            >
              {packing ? "zipping..." : "zip the stash"}
            </button>
            <button
              onClick={() => {
                clear();
                pushToast("stash emptied");
              }}
              className="brutal-border brutal-shadow-sm bg-surface px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest"
            >
              clear
            </button>
          </div>
        )}
      </header>

      {ready && stash.length === 0 ? (
        <div className="brutal-border bg-surface p-12 text-center">
          <p className="font-display text-3xl">nothing hoarded yet.</p>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-fg-dim">
            tap the nut on any card to start a stash
          </p>
          <Link
            href="/"
            className="mt-5 inline-block brutal-border brutal-shadow-sm bg-acid px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-bg"
          >
            go find some
          </Link>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {stash.map((meme, i) => (
            <MemeCard key={meme.id} meme={meme} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
