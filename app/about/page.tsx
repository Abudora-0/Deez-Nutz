import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "What Deez Nutz is, how it works, and the fine print.",
};

const FACTS = [
  ["Content", "Every meme is original art generated from a small spec by a hand written SVG engine. Nothing is scraped or reposted."],
  ["Rendering", "Art is drawn on the fly in your browser and on the server. Downloads are rasterized to PNG with canvas, or handed to you as animated SVG."],
  ["Storage", "Favorites and the download counter live in your browser localStorage. There is no account, no database, no tracking."],
  ["Stack", "Next.js App Router, TypeScript, Tailwind, Motion, and a lot of hard shadows. Deployed on Vercel."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 py-4">
      <header>
        <h1 className="font-display text-5xl leading-none md:text-6xl">
          It is a website. It is called Deez Nutz.
        </h1>
        <p className="mt-4 text-lg text-fg-dim">
          A meme and gif arcade with a neo brutalist paint job and controls tuned to match.
          Browse the stash, grab what you like, and post it wherever chaos is welcome.
        </p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2">
        {FACTS.map(([term, def]) => (
          <div key={term} className="brutal-border brutal-shadow-sm bg-surface p-4">
            <dt className="font-mono text-xs font-bold uppercase tracking-widest text-acid">{term}</dt>
            <dd className="mt-2 text-sm text-fg-dim">{def}</dd>
          </div>
        ))}
      </dl>

      <section className="brutal-border bg-surface p-5">
        <h2 className="font-display text-2xl">Keyboard</h2>
        <ul className="mt-3 grid gap-2 font-mono text-xs uppercase tracking-widest text-fg-dim sm:grid-cols-2">
          <li><kbd className="border-2 border-line px-1 text-fg">K</kbd> open the command menu</li>
          <li><kbd className="border-2 border-line px-1 text-fg">arrows</kbd> move through the grid</li>
          <li><kbd className="border-2 border-line px-1 text-fg">D</kbd> download the focused meme</li>
          <li><kbd className="border-2 border-line px-1 text-fg">F</kbd> favorite the focused meme</li>
          <li><kbd className="border-2 border-line px-1 text-fg">esc</kbd> close menus and modals</li>
          <li>up up down down left right left right b a</li>
        </ul>
      </section>

      <section id="license" className="scroll-mt-24 brutal-border bg-surface p-5">
        <h2 className="font-display text-2xl">Disclaimer and license</h2>
        <p className="mt-3 text-sm text-fg-dim">
          All art on this site is original work released under the MIT license. Use it, remix it,
          print it on a mug. The names of well known meme formats are referenced as cultural
          shorthand only. If you believe something here infringes your rights, open an issue on
          the repository and it will be handled quickly.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://github.com/Abudora-0/Deez-Nutz"
            target="_blank"
            rel="noreferrer noopener"
            className="brutal-border brutal-shadow-sm bg-acid px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-bg"
          >
            View source
          </a>
          <Link
            href="/"
            className="brutal-border brutal-shadow-sm bg-surface px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest"
          >
            Back to the gallery
          </Link>
        </div>
      </section>
    </div>
  );
}
