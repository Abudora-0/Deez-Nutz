import type { Meme, MascotPose, Palette } from "./types";
import { SITE_HOST } from "./site";

/*
  Pure SVG renderer for Deez Nutz meme art.
  Single source of truth: used by the React <MemeArt> component (client) and by
  the /api/meme/[slug] download route (server). No React, no DOM, no deps.

  Output is a self contained 1200 x 1200 SVG string. When `animated` is true
  (meme.type === "gif") a few SMIL animations are added so the downloaded .svg
  moves in any modern viewer.
*/

const SIZE = 1200;

interface Colors {
  ink: string;
  paper: string;
  accent: string;
  accent2: string;
}

const PALETTES: Record<Palette, Colors> = {
  acid: { ink: "#12100f", paper: "#f5eddd", accent: "#c6ff3d", accent2: "#4d7cff" },
  hot: { ink: "#12100f", paper: "#f5eddd", accent: "#ff2e88", accent2: "#ffb703" },
  volt: { ink: "#12100f", paper: "#f5eddd", accent: "#4d7cff", accent2: "#c6ff3d" },
  sun: { ink: "#12100f", paper: "#f5eddd", accent: "#ffb703", accent2: "#ff2e88" },
  grape: { ink: "#12100f", paper: "#f5eddd", accent: "#9b5de5", accent2: "#c6ff3d" },
  mono: { ink: "#12100f", paper: "#f5eddd", accent: "#f5eddd", accent2: "#b9ae98" },
};

const DISPLAY = "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Anton', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, 'Courier New', monospace";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fit(text: string, max: number, min: number, per = 0.58): number {
  const longest = text.length || 1;
  const guess = (SIZE - 200) / (longest * per);
  return Math.max(min, Math.min(max, Math.round(guess)));
}

/* ------------------------------------------------------------------ mascot */

function mascot(pose: MascotPose, c: Colors): string {
  if (pose === "none") return "";

  const body = `
    <path d="M0,-150 C70,-150 96,-96 80,-46 C72,-16 72,16 80,46 C96,96 70,150 0,150
             C-70,150 -96,96 -80,46 C-72,16 -72,-16 -80,-46 C-96,-96 -70,-150 0,-150 Z"
          fill="${c.paper}" stroke="${c.ink}" stroke-width="9"/>
    <path d="M-64,-70 Q0,-40 64,-70 M-70,0 Q0,26 70,0 M-64,70 Q0,100 64,70"
          fill="none" stroke="${c.ink}" stroke-width="5" opacity="0.5"/>`;

  let face = "";
  switch (pose) {
    case "grin":
    case "thumbsup":
      face = `
        <circle cx="-26" cy="-24" r="10" fill="${c.ink}"/>
        <circle cx="26" cy="-24" r="10" fill="${c.ink}"/>
        <path d="M-34,18 Q0,64 34,18 Z" fill="${c.ink}"/>`;
      break;
    case "shades":
    case "smug":
      face = `
        <rect x="-44" y="-38" width="38" height="24" rx="3" fill="${c.ink}"/>
        <rect x="6" y="-38" width="38" height="24" rx="3" fill="${c.ink}"/>
        <rect x="-8" y="-30" width="16" height="6" fill="${c.ink}"/>
        <path d="M-28,26 Q6,44 34,20" fill="none" stroke="${c.ink}" stroke-width="9" stroke-linecap="round"/>`;
      break;
    case "shrug":
      face = `
        <circle cx="-26" cy="-22" r="9" fill="${c.ink}"/>
        <circle cx="26" cy="-22" r="9" fill="${c.ink}"/>
        <path d="M-30,26 L30,26" stroke="${c.ink}" stroke-width="9" stroke-linecap="round"/>
        <path d="M-96,10 q-28,-6 -40,26 M96,10 q28,-6 40,26" fill="none" stroke="${c.ink}" stroke-width="9" stroke-linecap="round"/>`;
      break;
    case "point":
      face = `
        <circle cx="-24" cy="-22" r="9" fill="${c.ink}"/>
        <circle cx="28" cy="-22" r="9" fill="${c.ink}"/>
        <path d="M-26,22 Q6,40 30,18" fill="none" stroke="${c.ink}" stroke-width="9" stroke-linecap="round"/>
        <path d="M74,44 L150,120" stroke="${c.ink}" stroke-width="20" stroke-linecap="round"/>
        <circle cx="154" cy="124" r="16" fill="${c.ink}"/>`;
      break;
    case "flames":
      face = `
        <circle cx="-26" cy="-22" r="12" fill="${c.ink}"/>
        <circle cx="26" cy="-22" r="12" fill="${c.ink}"/>
        <path d="M-28,30 Q0,20 28,30" fill="none" stroke="${c.ink}" stroke-width="8" stroke-linecap="round"/>
        <g fill="${c.accent2}" stroke="${c.ink}" stroke-width="6">
          <path d="M-120,150 q-14,-56 22,-84 q-6,34 16,40 q26,-18 12,-58 q44,34 30,102 Z"/>
          <path d="M120,150 q14,-56 -22,-84 q6,34 -16,40 q-26,-18 -12,-58 q-44,34 -30,102 Z"/>
        </g>`;
      break;
    case "cry":
      face = `
        <path d="M-38,-30 q12,-10 24,0 M14,-30 q12,-10 24,0" fill="none" stroke="${c.ink}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="-26" cy="-18" r="9" fill="${c.ink}"/>
        <circle cx="26" cy="-18" r="9" fill="${c.ink}"/>
        <path d="M-30,40 Q0,14 30,40" fill="none" stroke="${c.ink}" stroke-width="9" stroke-linecap="round"/>
        <path d="M-30,-4 q-8,40 4,52 q12,-12 4,-52 Z" fill="${c.accent2}" stroke="${c.ink}" stroke-width="4"/>
        <path d="M28,-4 q-8,40 4,52 q12,-12 4,-52 Z" fill="${c.accent2}" stroke="${c.ink}" stroke-width="4"/>`;
      break;
    case "dead":
      face = `
        <path d="M-36,-32 l20,20 M-16,-32 l-20,20 M16,-32 l20,20 M36,-32 l-20,20" stroke="${c.ink}" stroke-width="8" stroke-linecap="round"/>
        <path d="M-24,26 h48 v10 h-14 v14 h-20 v-14 h-14 Z" fill="${c.accent}" stroke="${c.ink}" stroke-width="6"/>`;
      break;
    case "mindblown":
      face = `
        <circle cx="-26" cy="-20" r="16" fill="${c.paper}" stroke="${c.ink}" stroke-width="6"/>
        <circle cx="26" cy="-20" r="16" fill="${c.paper}" stroke="${c.ink}" stroke-width="6"/>
        <circle cx="-26" cy="-20" r="7" fill="${c.ink}"/>
        <circle cx="26" cy="-20" r="7" fill="${c.ink}"/>
        <ellipse cx="0" cy="36" rx="20" ry="26" fill="${c.ink}"/>
        <g stroke="${c.accent}" stroke-width="10" stroke-linecap="round">
          <path d="M0,-150 V-196"/><path d="M-70,-130 L-104,-166"/><path d="M70,-130 L104,-166"/>
        </g>`;
      break;
  }

  let extra = "";
  if (pose === "thumbsup") {
    extra = `<g transform="translate(96,44)">
      <path d="M0,20 q-4,-30 18,-34 q10,-2 8,10 l-4,14 h22 q12,0 10,14 l-8,34 q-3,12 -18,12 h-30 q-10,0 -10,-12 Z"
            fill="${c.accent}" stroke="${c.ink}" stroke-width="8"/></g>`;
  }

  return `<g>${body}${face}${extra}</g>`;
}

/* --------------------------------------------------------------- templates */

function frame(c: Colors, bg: string): string {
  return `<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${bg}"/>
    <rect x="14" y="14" width="${SIZE - 28}" height="${SIZE - 28}" fill="none" stroke="${c.ink}" stroke-width="18"/>`;
}

function halftone(color: string, id: string): string {
  return `<pattern id="${id}" width="46" height="46" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="4.2" fill="${color}"/>
    </pattern>`;
}

function stackedText(lines: string[], c: Colors, cy: number, gap: number, size: number): string {
  return lines
    .map((ln, i) => {
      const y = cy + i * gap;
      return `<text x="${SIZE / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}"
        font-size="${size}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${Math.max(6, size / 16)}"
        paint-order="stroke" style="letter-spacing:1px">${esc(ln.toUpperCase())}</text>`;
    })
    .join("");
}

function tmplClassic(m: Meme, c: Colors, animated: boolean): string {
  const longest = m.spec.lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  const size = fit(longest, 132, 66);
  const bottomAnchor = m.spec.note ? SIZE - 150 : SIZE - 96;
  let text: string;
  if (m.spec.lines.length === 1) {
    text = stackedText(m.spec.lines, c, SIZE / 2 + size / 3, size * 1.1, size);
  } else {
    const top = stackedText(m.spec.lines.slice(0, 1), c, 156, size * 1.1, size);
    const rest = stackedText(
      m.spec.lines.slice(1),
      c,
      bottomAnchor - (m.spec.lines.length - 2) * size * 1.1,
      size * 1.1,
      size,
    );
    text = top + rest;
  }
  const bob = animated
    ? `<animateTransform attributeName="transform" type="translate" values="820,860; 820,824; 820,860" dur="2.6s" repeatCount="indefinite" additive="sum"/>`
    : "";
  return `
    ${frame(c, c.accent)}
    <defs>${halftone("rgba(18,16,15,0.16)", "ht")}</defs>
    <rect x="14" y="14" width="${SIZE - 28}" height="${SIZE - 28}" fill="url(#ht)"/>
    <g transform="translate(820,860) scale(1.15)">${bob}${mascot(m.spec.mascot, c)}</g>
    ${text}
    ${note(m, c)}`;
}

function tmplStarburst(m: Meme, c: Colors, animated: boolean): string {
  const pts: string[] = [];
  const spikes = 22;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 560 : 430;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${(SIZE / 2 + Math.cos(a) * r).toFixed(1)},${(SIZE / 2 + Math.sin(a) * r).toFixed(1)}`);
  }
  const longest = m.spec.lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  const size = fit(longest, 118, 58, 0.66);
  const spin = animated
    ? `<animateTransform attributeName="transform" type="rotate" from="0 600 600" to="360 600 600" dur="18s" repeatCount="indefinite"/>`
    : "";
  const n = m.spec.lines.length;
  return `
    ${frame(c, c.accent2)}
    <g><polygon points="${pts.join(" ")}" fill="${c.accent}" stroke="${c.ink}" stroke-width="14">${spin}</polygon></g>
    <circle cx="600" cy="600" r="392" fill="${c.paper}" stroke="${c.ink}" stroke-width="14"/>
    ${stackedText(m.spec.lines, c, SIZE / 2 - (n - 1) * size * 0.56 + size / 3, size * 1.12, size)}
    ${note(m, c)}`;
}

function tmplStamp(m: Meme, c: Colors, animated: boolean): string {
  const longest = m.spec.lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  const size = fit(longest, 118, 54);
  const thump = animated
    ? `<animateTransform attributeName="transform" type="scale" values="1;1.04;1" dur="1.8s" repeatCount="indefinite" additive="sum"/>`
    : "";
  return `
    ${frame(c, c.paper)}
    <defs>${halftone("rgba(18,16,15,0.10)", "htp")}</defs>
    <rect x="14" y="14" width="${SIZE - 28}" height="${SIZE - 28}" fill="url(#htp)"/>
    <g transform="translate(600 585) rotate(-9)">
      <g transform="translate(0 0)">${thump}
        <rect x="-505" y="-195" width="1010" height="390" fill="${c.accent}"/>
        <rect x="-505" y="-195" width="1010" height="390" fill="none" stroke="${c.ink}" stroke-width="14"/>
        <rect x="-472" y="-162" width="944" height="324" fill="none" stroke="${c.ink}" stroke-width="7"/>
        ${m.spec.lines
          .map(
            (ln, i) =>
              `<text x="0" y="${-28 + i * size * 1.06 - (m.spec.lines.length - 1) * size * 0.4}" text-anchor="middle"
              font-family="${DISPLAY}" font-size="${size}" fill="${c.ink}" style="letter-spacing:3px">${esc(ln.toUpperCase())}</text>`,
          )
          .join("")}
      </g>
    </g>
    <g transform="translate(158 985) scale(0.86)">${mascot(m.spec.mascot, c)}</g>
    ${note(m, c)}`;
}

function tmplDrake(m: Meme, c: Colors, animated: boolean): string {
  const a = m.spec.lines[0] ?? "";
  const b = m.spec.lines[1] ?? "";
  const sz = 60;
  const wobble = animated
    ? `<animateTransform attributeName="transform" type="rotate" values="-4;4;-4" dur="1.4s" repeatCount="indefinite" additive="sum"/>`
    : "";
  const nod = animated
    ? `<animateTransform attributeName="transform" type="translate" values="0,0; 0,-14; 0,0" dur="1.8s" repeatCount="indefinite" additive="sum"/>`
    : "";
  const wrap = (t: string) => {
    const words = t.toUpperCase().split(/\s+/);
    const rows: string[] = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > 20) {
        rows.push(cur.trim());
        cur = w;
      } else cur += " " + w;
    }
    if (cur.trim()) rows.push(cur.trim());
    return rows.slice(0, 3);
  };
  const rowsA = wrap(a);
  const rowsB = wrap(b);
  return `
    ${frame(c, c.paper)}
    <rect x="14" y="14" width="${SIZE - 28}" height="${(SIZE - 28) / 2}" fill="${c.accent2}" stroke="${c.ink}" stroke-width="9"/>
    <rect x="14" y="${14 + (SIZE - 28) / 2}" width="${SIZE - 28}" height="${(SIZE - 28) / 2}" fill="${c.accent}" stroke="${c.ink}" stroke-width="9"/>
    <line x1="600" y1="14" x2="600" y2="${SIZE - 14}" stroke="${c.ink}" stroke-width="9"/>
    <g transform="translate(300 300) scale(1.15)"><g>${wobble}${mascot("shrug", c)}</g></g>
    <g transform="translate(300 900) scale(1.15)"><g>${nod}${mascot("thumbsup", c)}</g></g>
    ${rowsA
      .map(
        (r, i) =>
          `<text x="740" y="${300 - (rowsA.length - 1) * sz * 0.6 + i * sz * 1.15}" text-anchor="middle" font-family="${DISPLAY}"
          font-size="${sz}" fill="${c.paper}" stroke="${c.ink}" stroke-width="6" paint-order="stroke">${esc(r)}</text>`,
      )
      .join("")}
    ${rowsB
      .map(
        (r, i) =>
          `<text x="740" y="${900 - (rowsB.length - 1) * sz * 0.6 + i * sz * 1.15}" text-anchor="middle" font-family="${DISPLAY}"
          font-size="${sz}" fill="${c.ink}">${esc(r)}</text>`,
      )
      .join("")}`;
}

function tmplBrain(m: Meme, c: Colors, animated: boolean): string {
  const rows = m.spec.lines.slice(0, 4);
  const h = (SIZE - 28) / rows.length;
  const glows = ["0.15", "0.4", "0.7", "1"];
  return `
    ${frame(c, c.ink)}
    ${rows
      .map((ln, i) => {
        const y = 14 + i * h;
        const g = glows[Math.min(i, 3)];
        const pulse = animated
          ? `<animate attributeName="opacity" values="${g};${Math.min(1, Number(g) + 0.25)};${g}" dur="${1.6 + i * 0.3}s" repeatCount="indefinite"/>`
          : "";
        return `
        <line x1="14" y1="${y}" x2="${SIZE - 14}" y2="${y}" stroke="${c.accent2}" stroke-width="4" opacity="0.5"/>
        <text x="60" y="${y + h / 2 + 14}" font-family="${DISPLAY}" font-size="42" fill="${c.paper}">${esc(String(i + 1) + ".  " + ln.toUpperCase())}</text>
        <g transform="translate(1010 ${y + h / 2}) scale(${0.34 + i * 0.2})">
          <path d="M0,-150 C70,-150 96,-96 80,-46 C72,-16 72,16 80,46 C96,96 70,150 0,150 C-70,150 -96,96 -80,46 C-72,16 -72,-16 -80,-46 C-96,-96 -70,-150 0,-150 Z"
                fill="${c.accent}" opacity="${g}" stroke="${c.paper}" stroke-width="8">${pulse}</path>
          <path d="M-64,-60 Q0,-30 64,-60 M-70,10 Q0,40 70,10" fill="none" stroke="${c.ink}" stroke-width="6" opacity="${g}"/>
        </g>`;
      })
      .join("")}
    ${note(m, c)}`;
}

function tmplTerminal(m: Meme, c: Colors, animated: boolean): string {
  const lines = m.spec.lines.slice(0, 6);
  const blink = animated
    ? `<animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/>`
    : "";
  return `
    ${frame(c, "#0b0b0f")}
    <rect x="60" y="60" width="${SIZE - 120}" height="${SIZE - 120}" fill="#12100f" stroke="${c.accent}" stroke-width="8"/>
    <rect x="60" y="60" width="${SIZE - 120}" height="64" fill="${c.accent}"/>
    <circle cx="100" cy="92" r="12" fill="#12100f"/><circle cx="140" cy="92" r="12" fill="#12100f"/><circle cx="180" cy="92" r="12" fill="#12100f"/>
    <text x="600" y="100" text-anchor="middle" font-family="${MONO}" font-size="26" fill="#12100f">deez@nuts: ~</text>
    ${lines
      .map(
        (ln, i) =>
          `<text x="100" y="${190 + i * 62}" font-family="${MONO}" font-size="34" fill="${c.accent}">${esc(
            (i === 0 ? "$ " : "  ") + ln,
          )}</text>`,
      )
      .join("")}
    <rect x="${100 + (lines.length ? 20 : 0)}" y="${190 + lines.length * 62 - 30}" width="20" height="36" fill="${c.accent}">${blink}</rect>
    <g transform="translate(1000 1020) scale(0.7)">${mascot(m.spec.mascot, c)}</g>`;
}

function tmplBillboard(m: Meme, c: Colors, animated: boolean): string {
  const longest = m.spec.lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  const size = fit(longest, 260, 90, 0.52);
  const slide = animated
    ? `<animate attributeName="opacity" values="0.25;1;0.25" dur="3s" repeatCount="indefinite"/>`
    : "";
  return `
    ${frame(c, c.ink)}
    <rect x="14" y="14" width="${SIZE - 28}" height="${SIZE - 28}" fill="${c.accent}" opacity="0.12"/>
    ${m.spec.lines
      .map(
        (ln, i) =>
          `<text x="${SIZE / 2}" y="${SIZE / 2 - (m.spec.lines.length - 1) * size * 0.52 + i * size * 1.02 + size / 3}"
          text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" fill="${c.accent}"
          style="letter-spacing:-2px">${esc(ln.toUpperCase())}</text>`,
      )
      .join("")}
    <rect x="120" y="${SIZE - 150}" width="${SIZE - 240}" height="8" fill="${c.accent2}">${slide}</rect>
    ${note(m, c, c.paper)}`;
}

function note(m: Meme, c: Colors, color?: string): string {
  if (!m.spec.note) return "";
  return `<text x="${SIZE / 2}" y="${SIZE - 60}" text-anchor="middle" font-family="${MONO}"
    font-size="26" fill="${color ?? c.ink}" opacity="0.75" style="letter-spacing:2px">${esc(
      m.spec.note.toUpperCase(),
    )}</text>`;
}

const TEMPLATES: Record<string, (m: Meme, c: Colors, a: boolean) => string> = {
  classic: tmplClassic,
  starburst: tmplStarburst,
  stamp: tmplStamp,
  drake: tmplDrake,
  brain: tmplBrain,
  terminal: tmplTerminal,
  billboard: tmplBillboard,
};

export interface RenderOptions {
  /** force animation on or off, defaults to meme.type === "gif" */
  animated?: boolean;
  /** watermark shown bottom right, defaults to on */
  mark?: boolean;
}

export function memeSvg(m: Meme, opts: RenderOptions = {}): string {
  const c = PALETTES[m.spec.palette] ?? PALETTES.acid;
  const animated = opts.animated ?? m.type === "gif";
  const render = TEMPLATES[m.spec.template] ?? tmplClassic;
  const body = render(m, c, animated);
  const mark =
    opts.mark === false
      ? ""
      : `<text x="${SIZE - 40}" y="${SIZE - 34}" text-anchor="end" font-family="${MONO}" font-size="22"
          fill="${c.ink}" opacity="0.55">${SITE_HOST}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="${esc(
    m.title,
  )}">
  <title>${esc(m.title)}</title>
  ${body}
  ${mark}
</svg>`;
}

export function memeDataUri(m: Meme, opts?: RenderOptions): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(memeSvg(m, opts))}`;
}
