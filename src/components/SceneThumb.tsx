"use client";

import { useId } from "react";
import { autoPaint } from "@/lib/paints";
import type { ArtState, Scene } from "@/lib/types";
import { SceneArt } from "./SceneArt";

/** Static, non-interactive preview of a scene — used on the landing page and in the picker. */
export function SceneThumb({
  scene,
  state,
  dim = false,
  className,
}: {
  scene: Scene;
  state?: ArtState;
  dim?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const art = state ?? autoPaint(scene);
  return (
    <div className={className} style={{ opacity: dim ? 0.28 : 1, filter: dim ? "grayscale(1)" : undefined }}>
      <SceneArt scene={scene} state={art} uid={uid} className="h-full w-full" />
    </div>
  );
}
