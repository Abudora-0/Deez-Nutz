"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedLogo } from "@/components/logo/AnimatedLogo";
import { ACCENTS, useAppState } from "@/components/providers/AppState";
import { useFavorites } from "@/lib/favorites";

const NAV = [
  { href: "/", label: "Gallery" },
  { href: "/create", label: "Make" },
  { href: "/favorites", label: "Stash" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { setCommandOpen, accent, setAccent } = useAppState();
  const { count } = useFavorites();

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-line bg-bg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <AnimatedLogo className="text-xl sm:text-2xl" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className={`relative px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                  active ? "text-bg" : "text-fg hover:text-acid"
                }`}
              >
                {active && <span className="absolute inset-0 -z-10 bg-acid" />}
                {item.label}
                {item.href === "/favorites" && count > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center border-2 border-line bg-hot px-1 text-[10px] text-bg">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 lg:flex" role="group" aria-label="accent color">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                aria-label={`accent ${a.label}`}
                aria-pressed={accent === a.id}
                className={`h-5 w-5 border-[3px] transition-transform hover:scale-110 ${
                  accent === a.id ? "border-line scale-110" : "border-transparent"
                }`}
                style={{ background: a.hex }}
              />
            ))}
          </div>

          <button
            onClick={() => setCommandOpen(true)}
            aria-label="search"
            className="flex items-center gap-2 brutal-border bg-surface px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-fg-dim hover:text-fg"
          >
            <span aria-hidden>⌕</span>
            <span className="hidden sm:inline">search</span>
            <kbd className="hidden border-2 border-line px-1 sm:inline">K</kbd>
          </button>

          <a
            href="https://github.com/Abudora-0/Deez-Nutz"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden brutal-border bg-fg px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-0.5 sm:block"
          >
            src
          </a>
        </div>
      </div>

      <nav className="scroll-strip items-center gap-1 border-t-[3px] border-line px-4 py-2 md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              className={`shrink-0 whitespace-nowrap px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest ${
                active ? "bg-acid text-bg" : "text-fg"
              }`}
            >
              {item.label}
              {item.href === "/favorites" && count > 0 && (
                <span className="ml-1 text-hot">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
