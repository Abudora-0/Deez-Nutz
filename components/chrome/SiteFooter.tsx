import Link from "next/link";
import { AnimatedLogo } from "@/components/logo/AnimatedLogo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <AnimatedLogo className="text-2xl" href={null} />
          <p className="mt-3 max-w-sm text-sm text-fg-dim">
            An arcade for the internet&apos;s finest nonsense. Search it, caption it,
            grab it. No login, no watermarks, no tracking.
          </p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs font-bold uppercase tracking-widest">
          <span className="text-fg-dim">Site</span>
          <Link href="/" className="hover:text-acid">Gallery</Link>
          <Link href="/favorites" className="hover:text-acid">Your Stash</Link>
          <Link href="/about" className="hover:text-acid">About</Link>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs font-bold uppercase tracking-widest">
          <span className="text-fg-dim">Elsewhere</span>
          <a href="https://github.com/Abudora-0/Deez-Nutz" className="hover:text-acid" target="_blank" rel="noreferrer noopener">
            Source on GitHub
          </a>
          <a href="https://github.com/Abudora-0/Deez-Nutz/issues" className="hover:text-acid" target="_blank" rel="noreferrer noopener">
            Report a bug
          </a>
          <Link href="/about#license" className="hover:text-acid">MIT License</Link>
        </div>
      </div>

      <div className="border-t-[3px] border-line px-4 py-4 text-center font-mono text-[11px] uppercase tracking-widest text-fg-dim">
        Deez Nutz &copy; {new Date().getFullYear()} &middot; built with next.js and questionable judgement
      </div>
    </footer>
  );
}
