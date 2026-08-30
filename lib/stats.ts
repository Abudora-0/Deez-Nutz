"use client";

import { useSyncExternalStore } from "react";

/*
  A local, honest download counter. There is no backend, so we seed a plausible
  base and add whatever this browser has actually pulled down. Persisted in
  localStorage and exposed through a useSyncExternalStore compatible store.
*/

const KEY = "deeznutz:downloads";
const BASE = 133742;
const EVENT = "deeznutz:downloads-changed";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  const onEvent = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onEvent);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onEvent);
  };
}

export function getDownloads(): number {
  if (typeof window === "undefined") return BASE;
  const stored = Number(window.localStorage.getItem(KEY) ?? "0");
  return BASE + (Number.isFinite(stored) ? stored : 0);
}

export function bumpDownloads(by = 1): number {
  if (typeof window === "undefined") return BASE;
  const stored = Number(window.localStorage.getItem(KEY) ?? "0") || 0;
  const next = stored + by;
  window.localStorage.setItem(KEY, String(next));
  window.dispatchEvent(new CustomEvent(EVENT));
  emit();
  return BASE + next;
}

export function useDownloads(): number {
  return useSyncExternalStore(subscribe, getDownloads, () => BASE);
}
