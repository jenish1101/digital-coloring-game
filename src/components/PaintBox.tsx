"use client";

import { useId } from "react";
import { PALETTE, PATTERNS, patternDefId } from "@/lib/paints";
import type { Paint } from "@/lib/types";
import { PatternDef } from "./PatternDef";
import { BrushIcon, BucketIcon, DropperIcon, EraserIcon } from "./Icons";

const PATTERN_COLORS = ["#FF4D6D", "#3AA7FF", "#FFC93C", "#2FD6A5", "#8B5CFF", "#FF8A3D", "#FF8FC7", "#3FA34D"];

const TOOLS = [
  {
    Icon: BucketIcon,
    name: "Bucket fill",
    copy: "One tap floods a whole region — wings, hulls, volcano lava, whatever the outline holds.",
    tint: "#FFC93C",
  },
  {
    Icon: BrushIcon,
    name: "Freehand brush",
    copy: "Scribble extra detail. The brush is clipped to the region, so you literally cannot colour outside the lines.",
    tint: "#3AA7FF",
  },
  {
    Icon: DropperIcon,
    name: "Colour picker",
    copy: "Steal any colour already on the page to keep a creature's spots matching its wings.",
    tint: "#2FD6A5",
  },
  {
    Icon: EraserIcon,
    name: "Scrub eraser",
    copy: "Drag it over a mistake and the region wipes back to clean paper. Undo goes 90 steps deep.",
    tint: "#FF8FC7",
  },
];

export function PaintBox() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        {TOOLS.map(({ Icon, name, copy, tint }, i) => (
          <div
            key={name}
            className="panel-soft flex items-start gap-3 p-3.5 transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(32,38,61,.9)]"
            style={{ background: i % 2 ? "#fffdf7" : `${tint}33` }}
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-ink"
              style={{ background: tint }}
            >
              <Icon width={20} height={20} />
            </span>
            <span>
              <span className="font-display block text-lg leading-tight font-bold">{name}</span>
              <span className="block text-sm leading-snug font-semibold text-ink-soft">{copy}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="panel space-y-4 p-4">
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {PALETTE.length} crayons
          </h3>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {PALETTE.map((swatch) => (
              <span
                key={swatch.c}
                title={swatch.name}
                className="swatch block h-9 w-9"
                style={{ background: swatch.c }}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {PATTERNS.length} pattern pots
          </h3>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {PATTERNS.map((pattern, i) => {
              const preview: Paint = {
                t: "pat",
                p: pattern.id,
                c: PATTERN_COLORS[i % PATTERN_COLORS.length],
                c2: "#FFFFFF",
              };
              const id = patternDefId(preview, uid);
              return (
                <span
                  key={pattern.id}
                  title={pattern.label}
                  className="block overflow-hidden rounded-xl border-[3px] border-ink shadow-[3px_3px_0_rgba(32,38,61,.85)]"
                  style={{ height: 54 }}
                >
                  <svg viewBox="0 0 40 30" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <PatternDef paint={preview} id={id} />
                    </defs>
                    <rect width="40" height="30" fill={`url(#${id})`} />
                  </svg>
                </span>
              );
            })}
          </div>
        </div>

        <p className="rounded-xl border-2 border-dashed border-ink/30 bg-paper-deep px-3 py-2 text-xs leading-snug font-bold text-ink-soft">
          Patterns keep your crayon as the ink and let you choose the base colour underneath — stripes over sunshine,
          hearts over mint, stars over ink.
        </p>
      </div>
    </div>
  );
}
