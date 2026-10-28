"use client";

import { PATTERN_MAP } from "@/lib/paints";
import type { Paint } from "@/lib/types";

export function PatternDef({ paint, id }: { paint: Paint; id: string }) {
  if (paint.t !== "pat") return null;
  const spec = PATTERN_MAP[paint.p];
  const pick = (which: "c1" | "c2") => (which === "c1" ? paint.c : paint.c2);
  return (
    <pattern id={id} width={spec.size} height={spec.size} patternUnits="userSpaceOnUse">
      <rect width={spec.size} height={spec.size} fill={paint.c2} />
      {spec.shapes.map((shape, i) => {
        if (shape.k === "rect")
          return <rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={pick(shape.fill)} />;
        if (shape.k === "circle")
          return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={pick(shape.fill)} />;
        if (shape.k === "poly") return <polygon key={i} points={shape.points} fill={pick(shape.fill)} />;
        return (
          <path
            key={i}
            d={shape.d}
            fill={shape.fill ? pick(shape.fill) : "none"}
            stroke={shape.stroke ? pick(shape.stroke) : "none"}
            strokeWidth={shape.w ?? 0}
            strokeLinecap="round"
          />
        );
      })}
    </pattern>
  );
}
