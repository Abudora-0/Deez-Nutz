"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};

/** true only after the component has mounted on the client */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    get() {
      return window.matchMedia(query).matches;
    },
  };
}

export function useMediaQuery(query: string): boolean {
  const [store] = useState(() => mediaStore(query));
  return useSyncExternalStore(store.subscribe, store.get, () => false);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** run a callback once on mount, no state churn */
export function useOnMount(fn: () => void) {
  useEffect(fn, []); // eslint-disable-line react-hooks/exhaustive-deps
}
