"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAppState } from "@/components/providers/AppState";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function KonamiEasterEgg() {
  const [rain, setRain] = useState(false);
  const { pushToast } = useAppState();

  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      idx = key === CODE[idx] ? idx + 1 : key === CODE[0] ? 1 : 0;
      if (idx === CODE.length) {
        idx = 0;
        setRain(true);
        pushToast("CHEAT ACTIVATED: infinite nuts");
        setTimeout(() => setRain(false), 5200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pushToast]);

  const nuts = Array.from({ length: 44 });

  if (!rain) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 5.2, times: [0, 0.85, 1] }}
    >
      {nuts.map((_, i) => {
            const left = (i * 37) % 100;
            const delay = (i % 11) * 0.13;
            const dur = 2.4 + ((i * 7) % 20) / 10;
            return (
              <motion.span
                key={i}
                className="absolute text-3xl"
                style={{ left: `${left}%` }}
                initial={{ y: -80, rotate: 0 }}
                animate={{ y: "110vh", rotate: 540 }}
                transition={{ duration: dur, delay, ease: "easeIn" }}
              >
                🥜
              </motion.span>
        );
      })}
    </motion.div>
  );
}
