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

export interface Meme {
  id: string;
  slug: string;
  title: string;
  type: MemeType;
  tags: string[];
  blurb: string;
  spec: MemeSpec;
}

export type SortKey = "curated" | "az" | "za" | "spicy" | "fresh";
