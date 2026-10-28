"use client";

import { useMemo } from "react";

export type Splat = {
  id: number;
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
  size: number;
};

const CONFETTI_COLORS = ["#FF4D6D", "#FF8A3D", "#FFC93C", "#2FD6A5", "#3AA7FF", "#8B5CFF", "#FF8FC7", "#AEE04B"];

/** Paint droplets that fly out of every filled region. */
export function Splats({ splats }: { splats: Splat[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {splats.map((splat) => (
        <span
          key={splat.id}
          className="anim-splat absolute rounded-full"
          style={
            {
              left: splat.x,
              top: splat.y,
              width: splat.size,
              height: splat.size,
              background: splat.color,
              "--dx": `${splat.dx}px`,
              "--dy": `${splat.dy}px`,
              boxShadow: `0 0 0 2px rgba(32,38,61,.35)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Expanding ring shown where the player just painted. */
export function Ring({ ring }: { ring: { id: number; x: number; y: number; color: string } | null }) {
  if (!ring) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <span
        key={ring.id}
        className="anim-ring absolute h-16 w-16 rounded-full border-4"
        style={{ left: ring.x - 32, top: ring.y - 32, borderColor: ring.color }}
      />
    </div>
  );
}

/** Full-screen confetti burst keyed by `burst` so it replays on every win. */
export function Confetti({ burst }: { burst: number }) {
  const pieces = useMemo(() => {
    if (!burst) return [];
    return Array.from({ length: 110 }, (_, i) => {
      const size = 7 + Math.random() * 11;
      return {
        id: `${burst}-${i}`,
        left: Math.random() * 100,
        drift: `${(Math.random() - 0.5) * 260}px`,
        spin: `${Math.random() * 1080 - 540}deg`,
        dur: `${2.1 + Math.random() * 1.8}s`,
        delay: `${Math.random() * 0.55}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: size,
        h: size * (Math.random() > 0.5 ? 1 : 0.5),
        round: Math.random() > 0.72,
      };
    });
  }, [burst]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="anim-confetti absolute top-0 block"
          style={
            {
              left: `${piece.left}%`,
              width: piece.w,
              height: piece.h,
              background: piece.color,
              borderRadius: piece.round ? "50%" : "2px",
              border: "1.5px solid rgba(32,38,61,.35)",
              "--drift": piece.drift,
              "--spin": piece.spin,
              "--dur": piece.dur,
              "--delay": piece.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Little floating label used for combo feedback. */
export function FloatLabel({ label }: { label: { id: number; x: number; y: number; text: string; color: string } | null }) {
  if (!label) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <span
        key={label.id}
        className="anim-pop font-display absolute text-xl font-bold"
        style={{ left: label.x, top: label.y - 34, color: label.color, textShadow: "2px 2px 0 rgba(32,38,61,.85)" }}
      >
        {label.text}
      </span>
    </div>
  );
}
