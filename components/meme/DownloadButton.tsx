"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Meme } from "@/lib/types";
import { downloadMeme, copyImageToClipboard, copyText, shareMeme } from "@/lib/download";
import { useAppState } from "@/components/providers/AppState";
import { Confetti } from "@/components/ui/Confetti";

interface Props {
  meme: Meme;
  size?: "sm" | "lg";
  onDone?: () => void;
}

export function DownloadButton({ meme, size = "sm", onDone }: Props) {
  const { pushToast } = useAppState();
  const [open, setOpen] = useState(false);
  const [fire, setFire] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pad = size === "lg" ? "px-5 py-3 text-sm" : "px-3 py-2 text-xs";

  const grab = () => {
    downloadMeme(meme);
    setFire((f) => f + 1);
    pushToast("snagged it");
    onDone?.();
    setOpen(false);
  };

  const menu: [string, () => void][] = [
    ["Download", grab],
    ["Share", async () => {
      const r = await shareMeme(meme);
      if (r === "copied") pushToast("link copied");
      else if (r === "failed") pushToast("could not share");
      setOpen(false);
    }],
    ["Copy image", async () => {
      pushToast((await copyImageToClipboard(meme)) ? "image copied" : "cannot copy this one");
      setOpen(false);
    }],
    ["Copy markdown", async () => {
      pushToast((await copyText(`![${meme.title}](${meme.media.url})`)) ? "markdown copied" : "copy failed");
      setOpen(false);
    }],
    ["Copy image URL", async () => {
      pushToast((await copyText(meme.media.url)) ? "url copied" : "copy failed");
      setOpen(false);
    }],
    ["Copy share link", async () => {
      pushToast((await copyText(`${window.location.origin}/meme/${meme.slug}`)) ? "link copied" : "copy failed");
      setOpen(false);
    }],
  ];

  return (
    <div ref={wrap} className="relative inline-flex">
      <Confetti fire={fire} />
      <button
        onClick={grab}
        className={`brutal-border bg-acid font-mono font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-0.5 active:translate-y-0 ${pad}`}
      >
        Download
      </button>
      <button
        aria-label="more options"
        onClick={() => setOpen((o) => !o)}
        className={`ml-[3px] brutal-border bg-surface px-2 font-bold text-acid transition-transform hover:-translate-y-0.5 ${
          size === "lg" ? "text-sm" : "text-xs"
        }`}
      >
        ⋯
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-52 brutal-border bg-surface shadow-[6px_6px_0_0_var(--line)]"
          >
            {menu.map(([label, fn]) => (
              <button
                key={label}
                onClick={fn}
                className="block w-full px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-widest text-fg hover:bg-acid hover:text-bg"
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
