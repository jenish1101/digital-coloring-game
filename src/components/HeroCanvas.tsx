"use client";

import { useEffect, useMemo, useState } from "react";
import { SceneArt } from "./SceneArt";
import { autoPaint } from "@/lib/paints";
import { getScene } from "@/lib/scenes";
import type { ArtState } from "@/lib/types";

const HERO_SCENES = ["butterfly", "unicorn", "trex", "rocket", "fishy", "castle"];

/** Self-painting demo used on the landing page. */
export function HeroCanvas() {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);

  const scene = getScene(HERO_SCENES[index % HERO_SCENES.length])!;
  const target = useMemo(() => autoPaint(scene), [scene]);
  const uid = `hero${index}`;

  useEffect(() => {
    setRevealed(0);
  }, [scene]);

  useEffect(() => {
    if (revealed > scene.regions.length) {
      const pause = window.setTimeout(() => setIndex((i) => i + 1), 1900);
      return () => window.clearTimeout(pause);
    }
    const tick = window.setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 320 : 175);
    return () => window.clearTimeout(tick);
  }, [revealed, scene]);

  const state = useMemo<ArtState>(() => {
    const fills: ArtState["fills"] = {};
    scene.regions.slice(0, Math.max(0, revealed - 1)).forEach((region) => {
      const paint = target.fills[region.id];
      if (paint) fills[region.id] = paint;
    });
    return { fills, strokes: {} };
  }, [revealed, scene, target]);

  return (
    <div className="relative">
      <div
        className="panel anim-pop relative overflow-hidden p-0"
        style={{ transform: "rotate(-1.6deg)", boxShadow: "10px 10px 0 rgba(32,38,61,.92)" }}
      >
        <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink bg-paper-deep px-3 py-2">
          <span className="font-display text-sm font-bold">
            {scene.emoji} {scene.title}
          </span>
          <span className="font-display flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[11px] font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cherry" />
            painting itself…
          </span>
        </div>
        <div className="stage-paper aspect-[4/3] w-full">
          <SceneArt scene={scene} state={state} uid={uid} className="h-full w-full" />
        </div>
        <div className="flex items-center gap-2 border-t-[3px] border-ink bg-white px-3 py-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-ink bg-paper">
            <div
              className="rainbow-bar h-full transition-[width] duration-200 ease-out"
              style={{ width: `${(Math.min(revealed, scene.regions.length) / scene.regions.length) * 100}%` }}
            />
          </div>
          <span className="font-display text-[11px] font-bold tabular-nums text-ink-soft">
            {Math.min(revealed, scene.regions.length)}/{scene.regions.length}
          </span>
        </div>
      </div>

      <span
        className="anim-bob absolute -top-5 -right-4 grid h-16 w-16 place-items-center rounded-full border-[3px] border-ink bg-sunshine text-2xl"
        style={{ boxShadow: "4px 4px 0 rgba(32,38,61,.9)" }}
      >
        🖌️
      </span>
      <span
        className="anim-sparkle absolute -bottom-4 -left-4 grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-ink bg-bubble text-xl"
        style={{ boxShadow: "4px 4px 0 rgba(32,38,61,.9)" }}
      >
        ✨
      </span>
    </div>
  );
}
