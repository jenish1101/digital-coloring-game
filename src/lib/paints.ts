import type { ArtState, Paint, PatternId, Scene } from "./types";

export type Swatch = { name: string; c: string };

export const PALETTE: Swatch[] = [
  { name: "Cherry", c: "#FF4D6D" },
  { name: "Tangerine", c: "#FF8A3D" },
  { name: "Sunshine", c: "#FFC93C" },
  { name: "Lemon", c: "#F6E95B" },
  { name: "Pistachio", c: "#AEE04B" },
  { name: "Mint", c: "#2FD6A5" },
  { name: "Fern", c: "#3FA34D" },
  { name: "Lagoon", c: "#19B8C9" },
  { name: "Sky", c: "#3AA7FF" },
  { name: "Denim", c: "#3B5BDB" },
  { name: "Grape", c: "#8B5CFF" },
  { name: "Orchid", c: "#D946EF" },
  { name: "Bubblegum", c: "#FF8FC7" },
  { name: "Cocoa", c: "#8B5E3C" },
  { name: "Caramel", c: "#D99A5B" },
  { name: "Sand", c: "#F5D9A8" },
  { name: "Cloud", c: "#FFFFFF" },
  { name: "Fog", c: "#B9C3D6" },
  { name: "Slate", c: "#6B7A99" },
  { name: "Ink", c: "#20263D" },
];

export type PatShape =
  | { k: "rect"; x: number; y: number; w: number; h: number; fill: "c1" | "c2" }
  | { k: "circle"; cx: number; cy: number; r: number; fill: "c1" | "c2" }
  | { k: "path"; d: string; w?: number; stroke?: "c1" | "c2"; fill?: "c1" | "c2" }
  | { k: "poly"; points: string; fill: "c1" | "c2" };

export type PatternSpec = { id: PatternId; label: string; size: number; shapes: PatShape[] };

export const PATTERNS: PatternSpec[] = [
  {
    id: "stripes",
    label: "Stripes",
    size: 16,
    shapes: [{ k: "path", d: "M-4 4 L4 -4 M0 16 L16 0 M12 20 L20 12", w: 5, stroke: "c1" }],
  },
  {
    id: "dots",
    label: "Dots",
    size: 16,
    shapes: [
      { k: "circle", cx: 4, cy: 4, r: 2.8, fill: "c1" },
      { k: "circle", cx: 12, cy: 12, r: 2.8, fill: "c1" },
    ],
  },
  {
    id: "check",
    label: "Checker",
    size: 16,
    shapes: [
      { k: "rect", x: 0, y: 0, w: 8, h: 8, fill: "c1" },
      { k: "rect", x: 8, y: 8, w: 8, h: 8, fill: "c1" },
    ],
  },
  {
    id: "zigzag",
    label: "Zigzag",
    size: 18,
    shapes: [{ k: "path", d: "M0 13 L4.5 5 L9 13 L13.5 5 L18 13", w: 3, stroke: "c1" }],
  },
  {
    id: "stars",
    label: "Stars",
    size: 22,
    shapes: [
      {
        k: "path",
        d: "M11 3 L13.2 8.4 L19 8.9 L14.6 12.7 L16 18.4 L11 15.3 L6 18.4 L7.4 12.7 L3 8.9 L8.8 8.4 Z",
        fill: "c1",
      },
    ],
  },
  {
    id: "hearts",
    label: "Hearts",
    size: 20,
    shapes: [
      {
        k: "path",
        d: "M10 16.5 C3.5 12 2.4 6.6 6.2 5 C8.3 4.1 10 5.6 10 7 C10 5.6 11.7 4.1 13.8 5 C17.6 6.6 16.5 12 10 16.5 Z",
        fill: "c1",
      },
    ],
  },
  {
    id: "waves",
    label: "Waves",
    size: 20,
    shapes: [
      { k: "path", d: "M0 7 Q5 1 10 7 T20 7", w: 2.6, stroke: "c1" },
      { k: "path", d: "M0 17 Q5 11 10 17 T20 17", w: 2.6, stroke: "c1" },
    ],
  },
  {
    id: "confetti",
    label: "Confetti",
    size: 20,
    shapes: [
      { k: "circle", cx: 4, cy: 5, r: 1.9, fill: "c1" },
      { k: "circle", cx: 15, cy: 10, r: 1.9, fill: "c1" },
      { k: "poly", points: "8,15 11,13 11,18", fill: "c1" },
      { k: "rect", x: 16, y: 2, w: 3, h: 3, fill: "c1" },
    ],
  },
];

export const PATTERN_MAP: Record<PatternId, PatternSpec> = PATTERNS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PatternId, PatternSpec>,
);

/** CSS/DOM-safe id for a paint's pattern definition. */
export function paintKey(paint: Paint): string {
  if (paint.t === "solid") return `s:${paint.c}`;
  return `p:${paint.p}:${paint.c}:${paint.c2}`;
}

export function patternDefId(paint: Paint, prefix: string): string {
  const clean = paintKey(paint).replace(/[^a-zA-Z0-9]/g, "");
  return `${prefix}${clean}`;
}

export function samePaint(a?: Paint | null, b?: Paint | null): boolean {
  if (!a || !b) return false;
  return paintKey(a) === paintKey(b);
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function mulberry(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isDark(hex: string): boolean {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((ch) => ch + ch).join("") : value;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}

/** Deterministic, cheerful auto-colouring used for previews and the "Surprise me!" button. */
export function autoPaint(scene: Scene): ArtState {
  const rnd = mulberry(hash(scene.id));
  const night = isDark(scene.paper);
  const fills: Record<string, Paint> = {};
  for (const region of scene.regions) {
    const id = region.id;
    let color: string;
    if (/sky|space|water|sea|bg|backdrop/i.test(id)) color = night ? "#2C3A78" : "#8FD6FF";
    else if (/sun|star|flame|lava/i.test(id)) color = night ? "#FFE066" : "#FFC93C";
    else if (/hill|ground|grass|meadow|lawn|path|sand/i.test(id)) color = night ? "#3E6B4F" : "#8ED081";
    else if (/cloud|smoke|wave|moon/i.test(id)) color = night ? "#C7D2F2" : "#FFFFFF";
    else if (/belly|tummy|muzzle/i.test(id)) color = night ? "#F0C89A" : "#F5D9A8";
    else color = PALETTE[Math.floor(rnd() * 13)].c;
    if (rnd() < 0.18) {
      const pats = PATTERNS;
      fills[id] = {
        t: "pat",
        p: pats[Math.floor(rnd() * pats.length)].id,
        c: PALETTE[Math.floor(rnd() * 13)].c,
        c2: color,
      };
    } else {
      fills[id] = { t: "solid", c: color };
    }
  }
  return { fills, strokes: {} };
}

export function countPainted(state: ArtState, scene: Scene): number {
  return scene.regions.reduce((n, r) => {
    const filled = Boolean(state.fills[r.id]);
    const brushed = (state.strokes[r.id] ?? []).length > 0;
    return n + (filled || brushed ? 1 : 0);
  }, 0);
}
