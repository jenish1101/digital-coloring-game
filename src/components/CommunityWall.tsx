"use client";

import { useEffect, useState } from "react";
import { getScene } from "@/lib/scenes";
import { PALETTE } from "@/lib/paints";
import { recentArtworks } from "@/lib/studioStore";

export type WallItem = {
  id: string;
  title: string;
  sceneId: string;
  thumbnail: string;
  createdAt: string;
};

const TILTS = ["-2.4deg", "1.8deg", "-1.2deg", "2.6deg", "-2deg", "1.2deg"];

/** A pin-board of pictures saved in this browser. */
export function CommunityWall({ items }: { items: WallItem[] }) {
  if (!items.length) {
    return (
      <div className="panel-soft flex flex-wrap items-center justify-center gap-3 bg-white p-8 text-center">
        <p className="text-sm font-bold text-ink-soft">
          The wall is bare — the first artwork saved from this studio will be pinned right here.
        </p>
        <span className="flex gap-1.5">
          {PALETTE.slice(0, 8).map((swatch) => (
            <span key={swatch.c} className="h-4 w-4 rounded-full border-2 border-ink" style={{ background: swatch.c }} />
          ))}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const scene = getScene(item.sceneId);
        return (
          <figure
            key={item.id}
            className="anim-slide relative bg-white p-2.5 pb-8 shadow-[6px_6px_0_rgba(32,38,61,.9)]"
            style={{
              border: "3px solid #20263d",
              borderRadius: 6,
              transform: `rotate(${TILTS[index % TILTS.length]})`,
              animationDelay: `${index * 60}ms`,
            }}
          >
            <span
              className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-ink"
              style={{ background: PALETTE[index % PALETTE.length].c }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.thumbnail} alt={item.title} className="block aspect-[4/3] w-full object-cover" />
            <figcaption className="font-display absolute right-3 bottom-2 left-3 truncate text-sm font-bold">
              {item.title}
              {scene ? <span className="ml-1 text-xs font-semibold text-ink-soft">{scene.emoji}</span> : null}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export function StudioWall() {
  const [items, setItems] = useState<WallItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    recentArtworks(6)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <CommunityWall items={items} />;
}
