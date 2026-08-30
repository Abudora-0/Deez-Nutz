"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "deeznutz:favorites";
const EVENT = "deeznutz:favorites-changed";
const EMPTY: string[] = [];

const listeners = new Set<() => void>();
let cache: string[] = EMPTY;
let cacheRaw = "";

function readFresh(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY) ?? "[]";
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    const parsed = JSON.parse(raw);
    cache = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
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
  const ids = useSyncExternalStore(subscribe, readFresh, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toggle = useCallback((id: string) => {
    const current = readFresh();
    write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const clear = useCallback(() => write([]), []);

  return { ids, ready, toggle, has, clear, count: ids.length };
}
