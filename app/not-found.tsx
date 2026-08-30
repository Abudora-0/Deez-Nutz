import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="font-display text-8xl leading-none text-acid md:text-9xl">404</p>
      <h1 className="font-display text-3xl md:text-4xl">this nut does not exist</h1>
      <p className="max-w-md font-mono text-xs uppercase tracking-widest text-fg-dim">
        the page you asked for is in another repository. or it was never real. hard to say.
      </p>
      <Link
        href="/"
        className="brutal-border brutal-shadow bg-acid px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-1"
      >
        back to the arcade
      </Link>
    </div>
  );
}
