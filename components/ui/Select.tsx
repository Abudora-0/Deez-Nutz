"use client";

import * as RS from "@radix-ui/react-select";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  label: string;
  className?: string;
}

export function Select({ value, onValueChange, options, label, className = "" }: Props) {
  return (
    <RS.Root value={value} onValueChange={onValueChange}>
      <RS.Trigger
        aria-label={label}
        className={`group inline-flex items-center justify-between gap-3 brutal-border brutal-shadow-sm bg-surface px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-fg transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 data-[state=open]:translate-x-[3px] data-[state=open]:translate-y-[3px] data-[state=open]:shadow-none ${className}`}
      >
        <span className="truncate">
          <RS.Value />
        </span>
        <RS.Icon className="shrink-0 text-acid transition-transform group-data-[state=open]:rotate-180">
          ▼
        </RS.Icon>
      </RS.Trigger>

      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={8}
          className="anim-pop z-[90] min-w-[var(--radix-select-trigger-width)] brutal-border bg-surface shadow-[6px_6px_0_0_var(--line)]"
        >
          <RS.Viewport className="p-1">
            {options.map((opt) => (
              <RS.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer select-none items-center justify-between gap-4 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-fg outline-none data-[highlighted]:bg-acid data-[highlighted]:text-bg data-[state=checked]:text-acid data-[state=checked]:data-[highlighted]:text-bg"
              >
                <RS.ItemText>{opt.label}</RS.ItemText>
                <span className="flex items-center gap-2">
                  {opt.hint && <span className="opacity-50">{opt.hint}</span>}
                  <RS.ItemIndicator>✦</RS.ItemIndicator>
                </span>
              </RS.Item>
            ))}
          </RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  );
}
