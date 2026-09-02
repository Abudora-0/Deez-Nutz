"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CaptionStudio, type CaptionSource } from "./CaptionStudio";
import { useAppState } from "@/components/providers/AppState";

interface Template {
  slug: string;
  title: string;
  url: string;
  width: number;
  height: number;
  boxCount: number;
  credit: string;
  creditUrl: string;
}

export function CreateClient({ templates }: { templates: Template[] }) {
  const { pushToast } = useAppState();
  const [source, setSource] = useState<CaptionSource | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushToast("that is not an image");
      return;
    }
    const url = URL.createObjectURL(file);
    setSource({ url, local: true, slug: "custom", boxCount: 2 });
  };

  if (source) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setSource(null)}
          className="self-start brutal-border bg-surface px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
        >
          ◄ start over
        </button>
        <CaptionStudio source={source} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className="flex flex-col items-center gap-3 brutal-border brutal-shadow bg-surface p-10 text-center"
      >
        <p className="font-display text-2xl">Drop an image here</p>
        <p className="font-mono text-xs uppercase tracking-widest text-fg-dim">or</p>
        <button
          onClick={() => fileRef.current?.click()}
          className="brutal-border brutal-shadow-sm bg-acid px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-transform hover:-translate-y-0.5"
        >
          Choose a file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <p className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">
          stays on your device, nothing is uploaded
        </p>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-fg-dim">
          or start from a template
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {templates.map((t) => (
            <button
              key={t.slug}
              onClick={() =>
                setSource({
                  url: t.url,
                  slug: t.slug,
                  width: t.width,
                  height: t.height,
                  boxCount: t.boxCount,
                  credit: t.credit,
                  creditUrl: t.creditUrl,
                })
              }
              className="group flex flex-col brutal-border brutal-shadow-sm bg-surface transition-transform hover:-translate-y-1"
            >
              <span className="relative block aspect-square overflow-hidden border-b-[3px] border-line bg-bg-2">
                <Image src={t.url} alt={t.title} fill sizes="25vw" className="object-contain" />
              </span>
              <span className="truncate p-2 font-mono text-[10px] uppercase tracking-wider text-fg-dim">
                {t.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
