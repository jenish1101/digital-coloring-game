"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { Scene } from "@/lib/types";
import { ArrowRightIcon, CheckIcon, ClockIcon, SaveIcon, SparkleIcon, StarIcon } from "./Icons";

export function Modal({
  open,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-ink/55 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div className={`panel anim-pop relative z-10 w-full ${wide ? "max-w-xl" : "max-w-md"} p-6`}>{children}</div>
    </div>
  );
}

export type UnlockItem = { label: string; emoji: string; kind: "scene" | "collection" };

export function CelebrateDialog({
  open,
  scene,
  seconds,
  paints,
  unlocks,
  collectionBadge,
  nextLabel,
  onSave,
  onNext,
  onKeep,
}: {
  open: boolean;
  scene: Scene;
  seconds: number;
  paints: number;
  unlocks: UnlockItem[];
  collectionBadge: string | null;
  nextLabel: string | null;
  onSave: () => void;
  onNext: () => void;
  onKeep: () => void;
}) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <Modal open={open} onClose={onKeep}>
      <div className="text-center">
        <span className="anim-wiggle mx-auto grid h-16 w-16 place-items-center rounded-full border-3 border-ink bg-sunshine text-3xl">
          🎨
        </span>
        <h2 className="font-display mt-3 text-3xl font-bold">Masterpiece!</h2>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          Every corner of <span className="text-ink">{scene.title}</span> is covered in colour.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="panel-soft flex items-center justify-center gap-2 px-3 py-2">
            <ClockIcon width={18} height={18} />
            <span className="font-display text-lg font-bold tabular-nums">
              {mm}:{ss}
            </span>
          </div>
          <div className="panel-soft flex items-center justify-center gap-2 px-3 py-2">
            <SparkleIcon width={18} height={18} />
            <span className="font-display text-lg font-bold tabular-nums">{paints} paints</span>
          </div>
        </div>

        {collectionBadge ? (
          <div className="anim-pop mt-4 rounded-2xl border-3 border-ink bg-bubble p-3 shadow-[4px_4px_0_rgba(32,38,61,.9)]">
            <p className="font-display flex items-center justify-center gap-2 text-lg font-bold">
              <StarIcon width={20} height={20} /> {collectionBadge}
            </p>
            <p className="text-xs font-bold text-ink/75">Collection badge earned — it is yours forever.</p>
          </div>
        ) : null}

        {unlocks.length ? (
          <div className="mt-4 space-y-2 text-left">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Unlocked</p>
            {unlocks.map((item) => (
              <div key={item.label} className="anim-slide panel-soft flex items-center gap-2.5 bg-mint/35 px-3 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-base">
                  {item.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block truncate text-sm font-bold">{item.label}</span>
                  <span className="block text-[11px] font-bold text-ink-soft">
                    {item.kind === "collection" ? "New collection" : "New colouring page"}
                  </span>
                </span>
                <CheckIcon width={18} height={18} />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-2">
          <button type="button" className="btn bg-mint px-4 py-2.5" onClick={onSave}>
            <span className="flex items-center justify-center gap-2">
              <SaveIcon width={18} height={18} /> Save to my gallery
            </span>
          </button>
          {nextLabel ? (
            <button type="button" className="btn bg-sunshine px-4 py-2.5" onClick={onNext}>
              <span className="flex items-center justify-center gap-2">
                {nextLabel} <ArrowRightIcon width={18} height={18} />
              </span>
            </button>
          ) : null}
          <button type="button" className="btn bg-[#fffdf7] px-4 py-2" onClick={onKeep}>
            Keep colouring this one
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function SaveDialog({
  open,
  title,
  onTitle,
  preview,
  busy,
  error,
  savedCount,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onTitle: (value: string) => void;
  preview: string | null;
  busy: boolean;
  error: string | null;
  savedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h2 className="font-display text-2xl font-bold">Save your artwork</h2>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        It lands in your gallery with the paints, patterns and brushwork exactly as they are.
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border-3 border-ink bg-white shadow-[4px_4px_0_rgba(32,38,61,.9)]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Artwork preview" className="block h-auto w-full" />
        ) : (
          <div className="grid h-40 place-items-center text-sm font-bold text-ink-soft">Rendering preview…</div>
        )}
      </div>

      <label className="font-display mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft" htmlFor="artwork-title">
        Title
      </label>
      <input
        id="artwork-title"
        value={title}
        maxLength={60}
        onChange={(event) => onTitle(event.target.value)}
        className="mt-1.5 w-full rounded-xl border-3 border-ink bg-[#fffdf7] px-3 py-2 font-semibold outline-none focus:bg-white"
        placeholder="Sunset Butterfly"
      />
      {error ? <p className="mt-2 text-sm font-bold text-cherry">{error}</p> : null}
      {savedCount > 0 ? (
        <p className="mt-2 text-xs font-bold text-ink-soft">
          You already have {savedCount} saved version{savedCount === 1 ? "" : "s"} of this page — saving again adds a new one.
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" className="btn bg-[#fffdf7] px-4 py-2.5" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn bg-mint px-4 py-2.5" onClick={onConfirm} disabled={busy || !title.trim()}>
          {busy ? "Saving…" : "Save artwork"}
        </button>
      </div>
    </Modal>
  );
}
