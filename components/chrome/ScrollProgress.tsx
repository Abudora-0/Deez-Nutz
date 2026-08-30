"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.4 });

  return (
    <div className="fixed inset-x-0 top-0 z-[65] h-[6px] border-b-[3px] border-line bg-bg-2">
      <motion.div
        className="h-full origin-left bg-acid"
        style={{ scaleX }}
      />
    </div>
  );
}
