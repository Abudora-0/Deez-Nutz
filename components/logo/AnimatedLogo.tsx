"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

interface Props {
  variant?: "full" | "mark";
  className?: string;
  href?: string | null;
}

const LEFT = "M60,6 L50,28 L62,42 L48,60 L60,78 L50,96 L60,114 C18,114 4,74 17,42 C25,20 40,6 60,6 Z";
const RIGHT = "M60,6 L50,28 L62,42 L48,60 L60,78 L50,96 L60,114 C102,114 116,74 103,42 C95,20 80,6 60,6 Z";

function NutMark({ reduced }: { reduced: boolean | null }) {
  const gap = reduced ? 3 : 2;
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="h-full w-auto shrink-0 overflow-visible"
      initial="load"
      animate="idle"
      whileHover="crack"
      aria-hidden="true"
    >
      {/* spark core */}
      <motion.g
        variants={{
          load: { scale: 0, opacity: 0 },
          idle: { scale: reduced ? 0.9 : 0.7, opacity: reduced ? 1 : 0.85 },
          crack: { scale: 1.15, opacity: 1 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        style={{ transformOrigin: "60px 60px" }}
      >
        <motion.path
          d="M60,24 L69,50 L96,50 L74,66 L82,94 L60,77 L38,94 L46,66 L24,50 L51,50 Z"
          fill="var(--acid)"
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinejoin="round"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={reduced ? undefined : { duration: 14, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        />
      </motion.g>

      {/* left shell half */}
      <motion.g
        variants={{
          load: { x: 0, rotate: 0 },
          idle: { x: -gap, rotate: reduced ? -3 : [-3, -6, -3] },
          crack: { x: -12, rotate: -14 },
        }}
        transition={{
          x: { type: "spring", stiffness: 260, damping: 18 },
          rotate: reduced
            ? { type: "spring" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformOrigin: "60px 60px" }}
      >
        <path d={LEFT} fill="var(--paper)" stroke="var(--ink)" strokeWidth="6" strokeLinejoin="round" />
        <path
          d="M34,40 Q44,52 36,66 M46,26 Q52,40 44,52"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3.5"
          opacity="0.45"
        />
      </motion.g>

      {/* right shell half */}
      <motion.g
        variants={{
          load: { x: 0, rotate: 0 },
          idle: { x: gap, rotate: reduced ? 3 : [3, 6, 3] },
          crack: { x: 12, rotate: 14 },
        }}
        transition={{
          x: { type: "spring", stiffness: 260, damping: 18 },
          rotate: reduced
            ? { type: "spring" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformOrigin: "60px 60px" }}
      >
        <path d={RIGHT} fill="var(--paper)" stroke="var(--ink)" strokeWidth="6" strokeLinejoin="round" />
        <path
          d="M86,40 Q76,52 84,66 M74,26 Q68,40 76,52"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3.5"
          opacity="0.45"
        />
      </motion.g>
    </motion.svg>
  );
}

const WORD = "DEEZ NUTZ";

export function AnimatedLogo({ variant = "full", className = "", href = "/" }: Props) {
  const reduced = useReducedMotion();

  const inner = (
    <span className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="h-[1.6em]">
        <NutMark reduced={reduced} />
      </span>

      {variant === "full" && (
        <motion.span
          className="font-display leading-none tracking-tight text-fg"
          style={{ fontSize: "1em" }}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
          }}
          aria-label="Deez Nutz"
        >
          {WORD.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              variants={{
                hidden: { y: "0.7em", opacity: 0, rotate: -10, scaleY: 0.6 },
                show: {
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                  scaleY: 1,
                  transition: { type: "spring", stiffness: 500, damping: 24 },
                },
              }}
              whileHover={reduced ? undefined : { y: -4, color: "var(--acid)", rotate: 4 }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Deez Nutz home">
        {inner}
      </Link>
    );
  }
  return inner;
}
