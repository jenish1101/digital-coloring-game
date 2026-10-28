"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent, Ref } from "react";
import { strokePath } from "@/lib/geometry";
import { paintKey, patternDefId } from "@/lib/paints";
import type { ArtState, Paint, Scene, Shape, Stroke } from "@/lib/types";
import { INK } from "@/lib/types";
import { PatternDef } from "./PatternDef";

export type Tool = "fill" | "brush" | "eraser" | "pick";
export const CANVAS_REGION = "__canvas";

type ShapeProps = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  strokeLinejoin?: "round" | "miter" | "bevel";
  strokeLinecap?: "round" | "butt" | "square";
  style?: CSSProperties;
};

function ShapeEl({ shape, id, ...props }: { shape: Shape; id: string } & ShapeProps) {
  switch (shape.k) {
    case "path":
      return <path id={id} d={shape.d} {...props} />;
    case "circle":
      return <circle id={id} cx={shape.cx} cy={shape.cy} r={shape.r} {...props} />;
    case "ellipse":
      return <ellipse id={id} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...props} />;
    case "rect":
      return <rect id={id} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...props} />;
    case "poly":
      return <polygon id={id} points={shape.points} {...props} />;
  }
}

function StrokeEl({ stroke, id }: { stroke: Stroke; id: string }) {
  const d = strokePath(stroke.pts);
  if (!d) return null;
  return (
    <path
      id={id}
      d={d}
      fill="none"
      stroke={stroke.c}
      strokeWidth={stroke.w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

type Props = {
  scene: Scene;
  state: ArtState;
  uid: string;
  interactive?: boolean;
  tool?: Tool;
  hoverRegion?: string | null;
  live?: { regionId: string; stroke: Stroke } | null;
  extraPaints?: Paint[];
  onRegionDown?: (regionId: string, event: ReactPointerEvent<SVGGElement>) => void;
  onHover?: (regionId: string | null) => void;
  svgRef?: Ref<SVGSVGElement>;
  className?: string;
};

export function SceneArt({
  scene,
  state,
  uid,
  interactive = false,
  tool = "fill",
  hoverRegion = null,
  live = null,
  extraPaints = [],
  onRegionDown,
  onHover,
  svgRef,
  className,
}: Props) {
  const paints = new Map<string, Paint>();
  for (const paint of Object.values(state.fills)) if (paint.t === "pat") paints.set(paintKey(paint), paint);
  for (const paint of extraPaints) if (paint.t === "pat") paints.set(paintKey(paint), paint);

  const clipId = (regionId: string) => `${uid}-clip-${regionId}`;
  const cursor = !interactive
    ? "default"
    : tool === "brush"
      ? "crosshair"
      : tool === "eraser"
        ? "cell"
        : "pointer";

  const canvasStrokes = state.strokes[CANVAS_REGION] ?? [];
  const liveOnCanvas = live?.regionId === CANVAS_REGION ? live.stroke : null;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", touchAction: "none", cursor }}
      onPointerLeave={interactive ? () => onHover?.(null) : undefined}
    >
      <defs>
        {[...paints.entries()].map(([key, paint]) => (
          <PatternDef key={key} paint={paint} id={patternDefId(paint, uid)} />
        ))}
        {scene.regions.map((region) =>
          Boolean((state.strokes[region.id]?.length ?? 0) > 0 || live?.regionId === region.id) && region.shapes.length ? (
            <clipPath key={`cp-${region.id}`} id={clipId(region.id)} clipPathUnits="userSpaceOnUse">
              {region.shapes.map((shape, i) => (
                <ShapeEl key={i} id="" shape={shape} fill="#fff" stroke="none" />
              ))}
            </clipPath>
          ) : null,
        )}
        {canvasStrokes.length || liveOnCanvas ? (
          <clipPath id={clipId(CANVAS_REGION)} clipPathUnits="userSpaceOnUse">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        ) : null}
      </defs>

      <g transform={scene.mirror ? "translate(400 0) scale(-1 1)" : undefined}>
      <rect
        x="0"
        y="0"
        width="400"
        height="300"
        fill={scene.paper}
        data-region={CANVAS_REGION}
        onPointerDown={
          interactive && tool === "brush"
            ? (event) => onRegionDown?.(CANVAS_REGION, event as unknown as ReactPointerEvent<SVGGElement>)
            : undefined
        }
      />

      {scene.regions.map((region) => {
        const paint = state.fills[region.id];
        const fill = paint ? (paint.t === "solid" ? paint.c : `url(#${patternDefId(paint, uid)})`) : "#FFFFFF";
        const strokes = state.strokes[region.id] ?? [];
        const liveStroke = live?.regionId === region.id ? live.stroke : null;
        const hovered = interactive && hoverRegion === region.id;
        return (
          <g
            key={region.id}
            data-region={region.id}
            transform={region.transform}
            onPointerDown={interactive ? (event) => onRegionDown?.(region.id, event) : undefined}
            onPointerEnter={interactive ? () => onHover?.(region.id) : undefined}
          >
            {region.shapes.map((shape, i) => (
              <ShapeEl
                key={i}
                id=""
                shape={shape}
                fill={fill}
                stroke={INK}
                strokeWidth={2.4}
                strokeLinejoin="round"
              />
            ))}
            {hovered ? (
              <g data-fx="hover" style={{ pointerEvents: "none" }}>
                {region.shapes.map((shape, i) => (
                  <ShapeEl
                    key={i}
                    id=""
                    shape={shape}
                    fill="#FFFFFF"
                    opacity={0.35}
                    stroke="#FFC93C"
                    strokeWidth={3.6}
                  />
                ))}
              </g>
            ) : null}
            {strokes.length || liveStroke ? (
              <g clipPath={`url(#${clipId(region.id)})`} style={{ pointerEvents: "none" }}>
                {strokes.map((stroke, i) => (
                  <StrokeEl key={i} id="" stroke={stroke} />
                ))}
                {liveStroke ? <StrokeEl id="" stroke={liveStroke} /> : null}
              </g>
            ) : null}
            {region.detail?.map((shape, i) => (
              <g key={`d${i}`} style={{ pointerEvents: "none" }}>
                <ShapeEl id="" shape={shape} fill="none" stroke={INK} strokeWidth={1.7} opacity={0.85} />
              </g>
            ))}
          </g>
        );
      })}

      {canvasStrokes.length || liveOnCanvas ? (
        <g clipPath={`url(#${clipId(CANVAS_REGION)})`} style={{ pointerEvents: "none" }}>
          {canvasStrokes.map((stroke, i) => (
            <StrokeEl key={i} id="" stroke={stroke} />
          ))}
          {liveOnCanvas ? <StrokeEl id="" stroke={liveOnCanvas} /> : null}
        </g>
      ) : null}

      {scene.decor?.map((shape, i) => (
        <g key={`dec${i}`} style={{ pointerEvents: "none" }}>
          <ShapeEl id="" shape={shape} fill="none" stroke={INK} strokeWidth={2.1} opacity={0.9} />
        </g>
      ))}
      </g>
    </svg>
  );
}
