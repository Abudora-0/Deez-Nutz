"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Meme } from "./types";

/*
  Favorites store full (small) meme objects so the stash page can render items
  from every source, including Giphy gifs that may have rolled off trending.
*/

const KEY = "deeznutz:favorites";
const EVENT = "deeznutz:favorites-changed";
const EMPTY: Meme[] = [];

const listeners = new Set<() => void>();
let cache: Meme[] = EMPTY;
let cacheRaw = "";

function readFresh(): Meme[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY) ?? "[]";
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    const parsed = JSON.parse(raw);
    cache = Array.isArray(parsed)
      ? parsed.filter((x): x is Meme => x && typeof x.id === "string" && typeof x.slug === "string")
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: Meme[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const sync = () => cb();
  window.addEventListener("storage", sync);
  window.addEventListener(EVENT, sync);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", sync);
    window.removeEventListener(EVENT, sync);
  };
}

export function useFavorites() {
  const items = useSyncExternalStore(subscribe, readFresh, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toggle = useCallback((meme: Meme) => {
    const current = readFresh();
    write(
      current.some((m) => m.id === meme.id)
        ? current.filter((m) => m.id !== meme.id)
        : [...current, meme],
    );
  }, []);

  const has = useCallback((id: string) => items.some((m) => m.id === id), [items]);
  const clear = useCallback(() => write([]), []);

  return { items, ready, toggle, has, clear, count: items.length };
}
