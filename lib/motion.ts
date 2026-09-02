import type { Variants, Transition } from "motion/react";

export const spring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

export const popIn: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.94, rotate: -1.5 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: spring,
  },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

export const slamIn: Variants = {
  hidden: { opacity: 0, y: "18%", skewX: -6 },
  show: {
    opacity: 1,
    y: 0,
    skewX: 0,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};
