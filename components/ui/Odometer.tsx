"use client";

import { motion } from "motion/react";
import { useMounted } from "@/lib/hooks";

interface Props {
  value: number;
  className?: string;
  minLength?: number;
}

function Digit({ char }: { char: string }) {
  if (!/\d/.test(char)) {
    return <span className="px-[1px] opacity-60">{char}</span>;
  }
  const d = Number(char);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-bottom leading-none">
      <motion.span
        className="absolute left-0 top-0 flex w-full flex-col items-center leading-none"
        initial={{ y: `-${d}em` }}
        animate={{ y: `-${d}em` }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span key={n} className="flex h-[1em] w-full items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function Odometer({ value, className = "", minLength = 0 }: Props) {
  const mounted = useMounted();
  const digits = Math.max(0, Math.round(value)).toString().padStart(minLength, "0");
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (!mounted) {
    return <span className={`font-mono tabular-nums ${className}`}>{withCommas}</span>;
  }

  return (
    <span
      className={`inline-flex font-mono tabular-nums leading-none ${className}`}
      aria-label={String(value)}
    >
      {withCommas.split("").map((ch, i) => (
        <Digit key={`${withCommas.length}-${i}`} char={ch} />
      ))}
    </span>
  );
}
