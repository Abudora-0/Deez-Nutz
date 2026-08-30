"use client";

import * as RSwitch from "@radix-ui/react-switch";

interface Props {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  hint?: string;
}

export function Switch({ checked, onCheckedChange, label, hint }: Props) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-3">
      <RSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        className="relative h-8 w-14 shrink-0 brutal-border bg-surface transition-colors data-[state=checked]:bg-acid"
      >
        <RSwitch.Thumb className="block h-[22px] w-[22px] translate-x-[3px] border-[3px] border-line bg-fg transition-transform duration-150 ease-[cubic-bezier(0.16,1.11,0.3,1.02)] will-change-transform data-[state=checked]:translate-x-[31px] data-[state=checked]:bg-bg" />
      </RSwitch.Root>
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-xs font-bold uppercase tracking-widest">{label}</span>
        {hint && <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">{hint}</span>}
      </span>
    </label>
  );
}
