import type { Stroke } from "./types";

/** Build a smooth path from a flat [x,y,x,y...] point list. */
export function strokePath(pts: number[]): string {
  if (pts.length < 2) return "";
  if (pts.length < 6) return `M${pts[0]} ${pts[1]} L${pts[pts.length - 2]} ${pts[pts.length - 1]}`;
  let d = `M${pts[0]} ${pts[1]}`;
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2;
    const my = (pts[i + 1] + pts[i + 3]) / 2;
    d += ` Q${pts[i]} ${pts[i + 1]} ${mx} ${my}`;
  }
  d += ` L${pts[pts.length - 2]} ${pts[pts.length - 1]}`;
  return d;
}

export function strokeToElement(stroke: Stroke) {
  return { d: strokePath(stroke.pts), c: stroke.c, w: stroke.w };
}

/** Convert a pointer event into the local coordinate space of an SVG element. */
export function toLocalPoint(
  target: SVGGraphicsElement,
  clientX: number,
  clientY: number,
): [number, number] | null {
  const ctm = target.getScreenCTM() ?? target.ownerSVGElement?.getScreenCTM();
  if (!ctm) return null;
  const inverse = ctm.inverse();
  const x = inverse.a * clientX + inverse.c * clientY + inverse.e;
  const y = inverse.b * clientX + inverse.d * clientY + inverse.f;
  return [x, y];
}

export function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}
