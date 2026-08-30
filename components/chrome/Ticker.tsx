interface Props {
  items: string[];
  className?: string;
}

export function Ticker({ items, className = "" }: Props) {
  // doubled so the -50% translate loops seamlessly
  const run = [...items, ...items];
  return (
    <div
      className={`relative flex overflow-hidden border-y-[3px] border-line bg-fg text-bg select-none ${className}`}
      aria-hidden="true"
    >
      <div className="ticker-track flex min-w-max shrink-0 items-center gap-6 whitespace-nowrap py-2 font-mono text-sm font-bold uppercase tracking-widest">
        {run.map((item, i) => (
          <span key={i} className="flex items-center gap-6 pl-6">
            <span>{item}</span>
            <span className="text-hot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
