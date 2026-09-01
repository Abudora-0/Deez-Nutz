"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Meme } from "@/lib/types";
import { isOriginal } from "@/lib/types";
import { downloadMeme, downloadSvg, copyImageToClipboard } from "@/lib/download";
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
  const [busy, setBusy] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const original = isOriginal(meme);

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
  const label = meme.source === "imgflip" ? "Download blank" : "Download";

  const grab = async () => {
    setBusy(true);
    try {
      await downloadMeme(meme);
      setFire((f) => f + 1);
      pushToast("snagged it");
      onDone?.();
    } catch {
      pushToast("download failed, try again");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const grabSvg = () => {
    downloadSvg(meme);
    setFire((f) => f + 1);
    pushToast(`snagged ${meme.slug}.svg`);
    onDone?.();
    setOpen(false);
  };

  const copyImg = async () => {
    const ok = await copyImageToClipboard(meme);
    pushToast(ok ? "image copied to clipboard" : "cannot copy this one");
    setOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/meme/${meme.slug}`);
      pushToast("share link copied");
    } catch {
      pushToast("could not copy link");
    }
    setOpen(false);
  };

  const menu: [string, () => void][] = [
    [label, grab],
    ...(original ? ([["Download SVG", grabSvg]] as [string, () => void][]) : []),
    ["Copy image", copyImg],
    ["Copy share link", copyLink],
  ];

  return (
    <div ref={wrap} className="relative inline-flex">
      <Confetti fire={fire} />
      <button
        onClick={grab}
        disabled={busy}
        className={`brutal-border bg-acid font-mono font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 ${pad}`}
      >
        {busy ? "grabbing..." : label}
      </button>
      <button
        aria-label="more download options"
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
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-48 brutal-border bg-surface shadow-[6px_6px_0_0_var(--line)]"
          >
            {menu.map(([itemLabel, fn]) => (
              <button
                key={itemLabel}
                onClick={fn}
                className="block w-full px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-widest text-fg hover:bg-acid hover:text-bg"
              >
                {itemLabel}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
