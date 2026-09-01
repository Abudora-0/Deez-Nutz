export type MemeType = "image" | "gif";

export type Template =
  | "classic"
  | "starburst"
  | "stamp"
  | "drake"
  | "brain"
  | "terminal"
  | "billboard";

export type Palette = "acid" | "hot" | "volt" | "sun" | "grape" | "mono";

export type MascotPose =
  | "grin"
  | "shades"
  | "thumbsup"
  | "shrug"
  | "point"
  | "flames"
  | "cry"
  | "dead"
  | "smug"
  | "mindblown"
  | "none";

export interface MemeSpec {
  template: Template;
  palette: Palette;
  mascot: MascotPose;
  /** one to four short lines of caption text */
  lines: string[];
  /** small footnote line, optional */
  note?: string;
}

/** where a gallery item comes from */
export type MemeSource = "original" | "giphy" | "imgflip" | "tenor" | "reddit";

/** the content category a source belongs to, used for the gallery tabs */
export type MemeKind = "originals" | "templates" | "gifs" | "fresh";

export function memeKind(source: MemeSource): MemeKind {
  switch (source) {
    case "original":
      return "originals";
    case "imgflip":
      return "templates";
    case "giphy":
    case "tenor":
      return "gifs";
    case "reddit":
      return "fresh";
  }
}

/** real hosted media for giphy gifs and imgflip templates */
export interface MemeMedia {
  /** full size url, a gif for giphy, a jpg for imgflip */
  url: string;
  /** still preview url for grids, falls back to url */
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
  /** present only when source is "original" */
  spec?: MemeSpec;
  /** present only when source is "giphy" or "imgflip" */
  media?: MemeMedia;
}

export type OriginalMeme = Meme & { source: "original"; spec: MemeSpec };
export type HostedMeme = Meme & {
  source: "giphy" | "imgflip" | "tenor" | "reddit";
  media: MemeMedia;
};

export function isOriginal(m: Meme): m is OriginalMeme {
  return m.source === "original" && !!m.spec;
}

export function isHosted(m: Meme): m is HostedMeme {
  return m.source !== "original" && !!m.media;
}

export type SortKey = "curated" | "az" | "za" | "spicy" | "fresh";
