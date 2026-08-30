"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (reduced || coarse) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      setActive(Boolean(t.closest("a,button,[role=button],input,select,[data-cursor=grab]")));
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, [reduced, coarse]);

  if (reduced || coarse) return null;

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-1 -mt-1 h-2 w-2 bg-acid"
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-8 w-8 border-[3px] border-acid transition-[width,height,background-color] duration-150"
        style={{
          marginLeft: active ? -20 : -16,
          marginTop: active ? -20 : -16,
          width: active ? 40 : 32,
          height: active ? 40 : 32,
          transform: "translate(-100px,-100px)",
          rotate: `${down ? 45 : 0}deg`,
          background: active ? "color-mix(in srgb, var(--acid) 18%, transparent)" : "transparent",
        }}
      />
    </>
  );
}
