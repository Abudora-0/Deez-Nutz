export type MemeType = "image" | "gif";

/** where a gallery item comes from */
export type MemeSource = "giphy" | "imgflip" | "reddit";

/** the content category a source belongs to, used for the gallery tabs */
export type MemeKind = "templates" | "gifs" | "fresh";

export function memeKind(source: MemeSource): MemeKind {
  switch (source) {
    case "imgflip":
      return "templates";
    case "giphy":
      return "gifs";
    case "reddit":
      return "fresh";
  }
}

/** real hosted media for every gallery item */
export interface MemeMedia {
  /** full size url, a gif for giphy, a jpg or png otherwise */
  url: string;
  /** smaller still preview url for grids, falls back to url */
  still?: string;
  width: number;
  height: number;
  /** imgflip caption box count, only present for templates */
  boxCount?: number;
  /** attribution shown in the UI */
  credit: string;
  creditUrl: string;
}

export interface Meme {
  id: string;
  slug: string;
  title: string;
  type: MemeType;
  tags: string[];
  blurb: string;
  source: MemeSource;
  media: MemeMedia;
}

/** kept as an alias so existing call sites keep reading cleanly */
export type HostedMeme = Meme;

export function isHosted(m: Meme): m is HostedMeme {
  return !!m.media;
}

/** a still image that can be run through the caption studio */
export function isCaptionable(m: Meme): boolean {
  return m.type === "image";
}

export type SortKey = "curated" | "az" | "za" | "spicy" | "fresh";
