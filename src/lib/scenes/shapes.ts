import type { Shape } from "../types";

export const p = (d: string): Shape => ({ k: "path", d });
export const c = (cx: number, cy: number, r: number): Shape => ({ k: "circle", cx, cy, r });
export const e = (cx: number, cy: number, rx: number, ry: number): Shape => ({
  k: "ellipse",
  cx,
  cy,
  rx,
  ry,
});
export const r = (x: number, y: number, w: number, h: number, rx = 0): Shape => ({
  k: "rect",
  x,
  y,
  w,
  h,
  rx,
});
export const poly = (points: string): Shape => ({ k: "poly", points });

/** Mirror around x = 200 in a 400-wide viewBox. */
export const MIRROR = "translate(400 0) scale(-1 1)";
