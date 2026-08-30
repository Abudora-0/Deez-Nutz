"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "@/components/providers/AppState";
import { spring } from "@/lib/motion";

export function Toaster() {
  const { toasts } = useAppState();
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[75] flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -40, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: 0, transition: spring }}
            exit={{ opacity: 0, x: -40, scale: 0.9 }}
            className="brutal-border brutal-shadow-sm bg-acid px-3 py-2 font-mono text-sm font-bold uppercase tracking-wide text-bg"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
