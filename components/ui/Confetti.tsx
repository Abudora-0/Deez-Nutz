"use client";

import { motion } from "motion/react";

const BITS = ["🥜", "✦", "★", "💥", "🔩"];
const COLORS = ["var(--acid)", "var(--hot)", "var(--volt)", "var(--sun)"];

export function Confetti({ fire }: { fire: number }) {
  if (fire <= 0) return null;
  return (
    <motion.div
      key={fire}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 1, times: [0, 0.7, 1] }}
    >
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 90 + ((i * 13) % 70);
        return (
          <motion.span
            key={i}
            className="absolute text-lg"
            style={{ color: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: 1,
              opacity: 0,
              rotate: (i % 2 ? 1 : -1) * 240,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {i % 3 === 0 ? BITS[i % BITS.length] : "▪"}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
