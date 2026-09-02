"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type AccentId = "acid" | "hot" | "volt" | "sun" | "grape";

export const ACCENTS: { id: AccentId; label: string; hex: string }[] = [
  { id: "acid", label: "Acid Lime", hex: "#c6ff3d" },
  { id: "hot", label: "Hot Pink", hex: "#ff2e88" },
  { id: "volt", label: "Volt Blue", hex: "#4d7cff" },
  { id: "sun", label: "Sun Amber", hex: "#ffb703" },
  { id: "grape", label: "Grape Soda", hex: "#9b5de5" },
];

const ACCENT_KEY = "deeznutz:accent";

/* accent lives in its own tiny store so reads are hydration safe */
const accentListeners = new Set<() => void>();

function readAccent(): AccentId {
  if (typeof window === "undefined") return "acid";
  const saved = window.localStorage.getItem(ACCENT_KEY) as AccentId | null;
  return saved && ACCENTS.some((a) => a.id === saved) ? saved : "acid";
}

function applyAccent(id: AccentId) {
  const entry = ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
  const root = document.documentElement;
  root.style.setProperty("--acid", entry.hex);
  root.dataset.accent = entry.id;
}

function writeAccent(id: AccentId) {
  window.localStorage.setItem(ACCENT_KEY, id);
  applyAccent(id);
  accentListeners.forEach((l) => l());
}

function subscribeAccent(cb: () => void) {
  accentListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === ACCENT_KEY) {
      applyAccent(readAccent());
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  // make sure the css var matches the stored value on first subscribe
  applyAccent(readAccent());
  return () => {
    accentListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

interface Toast {
  id: number;
  text: string;
}

interface AppStateValue {
  selectMode: boolean;
  setSelectMode: (v: boolean) => void;
  selected: string[];
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;

  chaos: boolean;
  /** bumps every time chaos is toggled on, use it as a reshuffle seed */
  chaosNonce: number;
  toggleChaos: () => void;

  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;

  /** shared search query, driven by the hero, the toolbar, or the palette */
  query: string;
  setQuery: (v: string) => void;
  /** bumps when something asks the gallery to jump into view */
  focusGalleryNonce: number;
  focusGallery: () => void;

  /** opens the fullscreen slideshow at an index, null closes it */
  slideshow: number | null;
  setSlideshow: (i: number | null) => void;

  accent: AccentId;
  setAccent: (a: AccentId) => void;

  toasts: Toast[];
  pushToast: (text: string) => void;
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [selectMode, setSelectModeState] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [chaos, setChaos] = useState(false);
  const [chaosNonce, setChaosNonce] = useState(1);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusGalleryNonce, setFocusGalleryNonce] = useState(0);
  const [slideshow, setSlideshow] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const focusGallery = useCallback(() => setFocusGalleryNonce((n) => n + 1), []);

  const accent = useSyncExternalStore(subscribeAccent, readAccent, () => "acid" as AccentId);
  const setAccent = useCallback((a: AccentId) => writeAccent(a), []);

  const clearSelected = useCallback(() => setSelected([]), []);

  const setSelectMode = useCallback((v: boolean) => {
    setSelectModeState(v);
    if (!v) setSelected([]);
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const pushToast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((cur) => [...cur, { id, text }]);
    setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 2600);
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      selectMode,
      setSelectMode,
      selected,
      isSelected: (id: string) => selected.includes(id),
      toggleSelected,
      clearSelected,
      chaos,
      chaosNonce,
      toggleChaos: () =>
        setChaos((c) => {
          if (!c) setChaosNonce((n) => n + 1);
          return !c;
        }),
      commandOpen,
      setCommandOpen,
      query,
      setQuery,
      focusGalleryNonce,
      focusGallery,
      slideshow,
      setSlideshow,
      accent,
      setAccent,
      toasts,
      pushToast,
    }),
    [
      selectMode,
      setSelectMode,
      selected,
      toggleSelected,
      clearSelected,
      chaos,
      chaosNonce,
      commandOpen,
      query,
      focusGalleryNonce,
      focusGallery,
      slideshow,
      accent,
      setAccent,
      toasts,
      pushToast,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
