"use client";

import { useEffect, useState } from "react";
import { COLLECTIONS, collectionProgress, getSceneEntry, isCollectionUnlocked, isUnlocked, lockMessage } from "@/lib/scenes";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockIcon, StarIcon } from "./Icons";
import { SceneThumb } from "./SceneThumb";

type Props = {
  currentSceneId: string;
  completed: ReadonlySet<string>;
  savedCounts: Record<string, number>;
  onSelect: (sceneId: string) => void;
  onLocked: (message: string) => void;
};

const RAIL_PAGE_SIZE = 8;

export function SceneRail({ currentSceneId, completed, savedCounts, onSelect, onLocked }: Props) {
  const current = getSceneEntry(currentSceneId);
  const [tab, setTab] = useState(current?.collection.id ?? COLLECTIONS[0].id);
  const [page, setPage] = useState(Math.floor((current?.sceneIndex ?? 0) / RAIL_PAGE_SIZE));

  useEffect(() => {
    const entry = getSceneEntry(currentSceneId);
    if (entry) {
      setTab(entry.collection.id);
      setPage(Math.floor(entry.sceneIndex / RAIL_PAGE_SIZE));
    }
  }, [currentSceneId]);

  const collection = COLLECTIONS.find((c) => c.id === tab) ?? COLLECTIONS[0];
  const pages = Math.ceil(collection.scenes.length / RAIL_PAGE_SIZE);
  const visibleScenes = collection.scenes.slice(page * RAIL_PAGE_SIZE, (page + 1) * RAIL_PAGE_SIZE);

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="border-b-[3px] border-ink bg-paper-deep p-2.5">
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="font-display text-sm font-bold">The colouring book</h2>
          <span className="font-display rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[10px] font-bold">500 pages</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {COLLECTIONS.map((col, i) => {
            const open = isCollectionUnlocked(i, completed);
            const { done, total } = collectionProgress(col, completed);
            const active = col.id === collection.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => {
                  setTab(col.id);
                  setPage(0);
                  if (!open) {
                    const first = getSceneEntry(col.scenes[0].id);
                    if (first) onLocked(lockMessage(first, completed));
                  }
                }}
                className="tool flex items-center gap-1.5 px-2 py-1.5 text-left"
                data-active={active}
                style={{ background: active ? col.accent : "#fffdf7" }}
                title={open ? col.blurb : "Locked collection"}
              >
                <span className="text-lg leading-none">{open ? col.emoji : "🔒"}</span>
                <span className="min-w-0">
                  <span className="font-display block truncate text-[11px] leading-tight font-semibold">{col.title}</span>
                  <span className="block text-[10px] leading-tight font-bold text-ink/70">{done}/{total} coloured</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
        <p className="px-1 text-[11px] leading-snug font-bold text-ink-soft">{collection.blurb}</p>
        {visibleScenes.map((scene, index) => {
          const entry = getSceneEntry(scene.id)!;
          const open = isUnlocked(entry, completed);
          const done = completed.has(scene.id);
          const active = scene.id === currentSceneId;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                if (!open) { onLocked(lockMessage(entry, completed)); return; }
                onSelect(scene.id);
              }}
              className={`flex w-full items-center gap-2.5 rounded-2xl border-[3px] p-2 text-left transition ${
                active ? "border-ink bg-sunshine shadow-[3px_3px_0_rgba(32,38,61,.9)]" : "border-ink/25 bg-[#fffdf7] hover:-translate-y-0.5 hover:border-ink hover:shadow-[3px_3px_0_rgba(32,38,61,.9)]"
              } ${open ? "" : "opacity-70"}`}
            >
              <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-white">
                <SceneThumb scene={scene} dim={!open} className="h-full w-full" />
                {!open ? <span className="absolute inset-0 grid place-items-center bg-ink/45 text-white"><LockIcon width={18} height={18} /></span> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block truncate text-[12px] leading-tight font-semibold">{page * RAIL_PAGE_SIZE + index + 1}. {scene.title}</span>
                <span className="block truncate text-[10px] leading-tight text-ink-soft">#{String(entry.pageNumber).padStart(3, "0")} · {open ? done ? "Finished!" : `${scene.regions.length} areas` : "Locked"}</span>
              </span>
              <span className="flex shrink-0 flex-col items-center gap-1">
                {done ? <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-mint"><CheckIcon width={14} height={14} /></span> : null}
                {savedCounts[scene.id] ? <span className="flex items-center gap-0.5 rounded-full border-2 border-ink bg-bubble px-1.5 text-[10px] font-bold"><StarIcon width={11} height={11} /> {savedCounts[scene.id]}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2 border-t-[3px] border-ink bg-paper-deep px-3 py-2">
        <button type="button" className="btn bg-white p-1.5" aria-label="Previous pages" disabled={page === 0} onClick={() => setPage((n) => Math.max(0, n - 1))}><ArrowLeftIcon width={14} height={14} /></button>
        <span className="font-display text-[11px] font-bold">Pages {page + 1} / {pages}</span>
        <button type="button" className="btn bg-white p-1.5" aria-label="Next pages" disabled={page >= pages - 1} onClick={() => setPage((n) => Math.min(pages - 1, n + 1))}><ArrowRightIcon width={14} height={14} /></button>
      </div>
    </div>
  );
}
