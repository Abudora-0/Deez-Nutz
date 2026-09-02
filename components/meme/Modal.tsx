"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-bg/80 p-4 backdrop-blur-sm md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={close}
    >
      <motion.div
        className="relative my-auto w-full max-w-4xl brutal-border bg-bg p-4 shadow-[12px_12px_0_0_var(--acid)] md:p-6"
        initial={{ y: 40, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={close}
          aria-label="close"
          className="absolute -right-3 -top-3 z-10 flex h-10 w-10 items-center justify-center brutal-border bg-hot font-display text-xl text-bg transition-transform hover:rotate-90"
        >
          ✕
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
