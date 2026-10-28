export type Shape =
  | { k: "path"; d: string }
  | { k: "circle"; cx: number; cy: number; r: number }
  | { k: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { k: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { k: "poly"; points: string };

export type Region = {
  /** Stable id used for paint state + clip paths. */
  id: string;
  /** Friendly name shown in the HUD ("Left Wing"). */
  label: string;
  shapes: Shape[];
  /** Optional transform, e.g. mirroring for symmetric creatures. */
  transform?: string;
  /** Outline-only decoration drawn on top of the fill (not colourable). */
  detail?: Shape[];
};

export type Scene = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  /** Paper colour behind the line art when exporting. */
  paper: string;
  regions: Region[];
  /** Some editions face the other way while retaining their own paint state. */
  mirror?: boolean;
  /** Pure outline decoration that is never colourable. */
  decor?: Shape[];
};

export type Collection = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  accent: string;
  scenes: Scene[];
};

export type PatternId =
  | "stripes"
  | "dots"
  | "check"
  | "zigzag"
  | "stars"
  | "hearts"
  | "waves"
  | "confetti";

export type Paint = { t: "solid"; c: string } | { t: "pat"; p: PatternId; c: string; c2: string };

export type Stroke = { c: string; w: number; pts: number[] };

export type ArtState = {
  fills: Record<string, Paint>;
  strokes: Record<string, Stroke[]>;
};

export const emptyState = (): ArtState => ({ fills: {}, strokes: {} });

export const INK = "#20263d";
