"use client";

import { useId } from "react";
import { PALETTE, PATTERNS, patternDefId, samePaint } from "@/lib/paints";
import type { Paint, PatternId } from "@/lib/types";
import type { Tool } from "./SceneArt";
import { PatternDef } from "./PatternDef";
import {
  BrushIcon,
  BucketIcon,
  DownloadIcon,
  DropperIcon,
  EraserIcon,
  RedoIcon,
  SaveIcon,
  TrashIcon,
  UndoIcon,
  WandIcon,
} from "./Icons";

const BASES = ["#FFFFFF", "#FFF6E6", "#FFE3F0", "#E4F3FF", "#E7FBEA", "#20263D"];

const TOOLS: { id: Tool; label: string; Icon: typeof BucketIcon; hint: string }[] = [
  { id: "fill", label: "Fill", Icon: BucketIcon, hint: "Tap a region to flood it with paint (1)" },
  { id: "brush", label: "Brush", Icon: BrushIcon, hint: "Draw inside the lines (2)" },
  { id: "eraser", label: "Erase", Icon: EraserIcon, hint: "Scrub a region clean (3)" },
  { id: "pick", label: "Pick", Icon: DropperIcon, hint: "Steal a colour from the picture (4)" },
];

type Props = {
  tool: Tool;
  paint: Paint;
  brushSize: number;
  canUndo: boolean;
  canRedo: boolean;
  onTool: (tool: Tool) => void;
  onPaint: (paint: Paint) => void;
  onBrushSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSurprise: () => void;
  onSave: () => void;
  onDownload: () => void;
};

export function ToolRail({
  tool,
  paint,
  brushSize,
  canUndo,
  canRedo,
  onTool,
  onPaint,
  onBrushSize,
  onUndo,
  onRedo,
  onClear,
  onSurprise,
  onSave,
  onDownload,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const activeColor = paint.t === "solid" ? paint.c : paint.c;
  const activeBase = paint.t === "pat" ? paint.c2 : "#FFFFFF";

  const selectColor = (color: string) => {
    if (paint.t === "pat") onPaint({ t: "pat", p: paint.p, c: color, c2: paint.c2 });
    else onPaint({ t: "solid", c: color });
  };

  const selectPattern = (p: PatternId) => {
    if (paint.t === "pat" && paint.p === p) onPaint({ t: "solid", c: paint.c });
    else onPaint({ t: "pat", p, c: activeColor === "#FFFFFF" ? "#FF4D6D" : activeColor, c2: activeBase });
  };

  const selectBase = (c2: string) => {
    onPaint({ t: "pat", p: paint.t === "pat" ? paint.p : "dots", c: activeColor, c2 });
  };

  return (
    <div className="panel flex h-full flex-col gap-4 overflow-y-auto p-4">
      <section>
        <RailTitle>Tools</RailTitle>
        <div className="grid grid-cols-4 gap-2">
          {TOOLS.map(({ id, label, Icon, hint }) => (
            <button
              key={id}
              type="button"
              title={hint}
              aria-label={hint}
              className="tool flex flex-col items-center gap-1 bg-[#fffdf7] px-1 py-2"
              data-active={tool === id}
              onClick={() => onTool(id)}
            >
              <Icon width={20} height={20} />
              <span className="font-display text-[11px] leading-none font-semibold">{label}</span>
            </button>
          ))}
        </div>
        {tool === "brush" ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-dashed border-ink/30 px-3 py-2">
            <span className="font-display text-xs font-semibold text-ink-soft">Nib</span>
            <input
              type="range"
              min={3}
              max={26}
              value={brushSize}
              onChange={(event) => onBrushSize(Number(event.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-paper-deep accent-[#FF4D6D]"
              aria-label="Brush size"
            />
            <span
              className="rounded-full border-2 border-ink"
              style={{ width: brushSize + 6, height: brushSize + 6, background: activeColor }}
            />
          </div>
        ) : null}
      </section>

      <section>
        <RailTitle>Crayons</RailTitle>
        <div className="grid grid-cols-5 gap-2">
          {PALETTE.map((swatch) => (
            <button
              key={swatch.c}
              type="button"
              title={swatch.name}
              aria-label={swatch.name}
              className="swatch h-9 w-9"
              style={{ background: swatch.c }}
              data-active={paint.t === "solid" && paint.c === swatch.c}
              onClick={() => onPaint({ t: "solid", c: swatch.c })}
            />
          ))}
        </div>
      </section>

      <section>
        <RailTitle>Pattern Pots</RailTitle>
        <div className="grid grid-cols-4 gap-2">
          {PATTERNS.map((pattern) => {
            const preview: Paint = { t: "pat", p: pattern.id, c: activeColor === "#FFFFFF" ? "#FF4D6D" : activeColor, c2: activeBase };
            const active = paint.t === "pat" && paint.p === pattern.id;
            return (
              <button
                key={pattern.id}
                type="button"
                title={pattern.label}
                aria-label={`${pattern.label} pattern`}
                aria-pressed={active}
                className="tool overflow-hidden bg-[#fffdf7] p-0"
                data-active={active}
                style={{ height: 46 }}
                onClick={() => selectPattern(pattern.id)}
              >
                <svg viewBox="0 0 40 30" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <PatternDef paint={preview} id={patternDefId(preview, `${uid}r`)} />
                  </defs>
                  <rect width="40" height="30" fill={`url(#${patternDefId(preview, `${uid}r`)})`} />
                </svg>
              </button>
            );
          })}
        </div>
        {paint.t === "pat" ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-display text-xs font-semibold text-ink-soft">Base</span>
            {BASES.map((base) => (
              <button
                key={base}
                type="button"
                aria-label={`Pattern base ${base}`}
                className="swatch h-7 w-7"
                style={{ background: base }}
                data-active={samePaint(paint, { t: "pat", p: paint.p, c: paint.c, c2: base })}
                onClick={() => selectBase(base)}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-auto grid grid-cols-2 gap-2">
        <button type="button" className="btn col-span-1 bg-[#fffdf7] px-2 py-2 text-sm" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <span className="flex items-center justify-center gap-1.5">
            <UndoIcon width={17} height={17} /> Undo
          </span>
        </button>
        <button type="button" className="btn col-span-1 bg-[#fffdf7] px-2 py-2 text-sm" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <span className="flex items-center justify-center gap-1.5">
            <RedoIcon width={17} height={17} /> Redo
          </span>
        </button>
        <button type="button" className="btn bg-bubble px-2 py-2 text-sm text-ink" onClick={onSurprise} title="Auto-colour the whole picture">
          <span className="flex items-center justify-center gap-1.5">
            <WandIcon width={17} height={17} /> Surprise
          </span>
        </button>
        <button type="button" className="btn bg-[#fffdf7] px-2 py-2 text-sm" onClick={onClear} title="Start the page over">
          <span className="flex items-center justify-center gap-1.5">
            <TrashIcon width={17} height={17} /> Clear
          </span>
        </button>
        <button type="button" className="btn col-span-2 bg-mint px-2 py-2.5 text-sm" onClick={onSave}>
          <span className="flex items-center justify-center gap-1.5">
            <SaveIcon width={17} height={17} /> Save to gallery
          </span>
        </button>
        <button type="button" className="btn col-span-2 bg-sunshine px-2 py-2 text-sm" onClick={onDownload}>
          <span className="flex items-center justify-center gap-1.5">
            <DownloadIcon width={17} height={17} /> Download PNG
          </span>
        </button>
      </section>
    </div>
  );
}

function RailTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{children}</h3>
  );
}
