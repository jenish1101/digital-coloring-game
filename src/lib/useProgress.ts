"use client";

import { useEffect, useMemo, useState } from "react";
import { getProfile } from "./profile";
import type { Profile } from "./profile";
import { loadProgress } from "./studioStore";

export type CompletedRow = {
  sceneId: string;
  collectionId: string;
  paints: number;
  seconds: number;
  completedAt: string;
};

export function useProgress() {
  const [profile, setProfile] = useState<Profile>({ id: "loading", name: "Studio Artist" });
  const [rows, setRows] = useState<Record<string, CompletedRow>>({});
  const [savedCounts, setSavedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const me = getProfile();
    setProfile(me);
    let cancelled = false;
    (async () => {
      try {
        const data = await loadProgress(me.id);
        if (cancelled) return;
        const map: Record<string, CompletedRow> = {};
        for (const row of data.completed ?? []) map[row.sceneId] = row;
        setRows(map);
        setSavedCounts(data.savedCounts ?? {});
      } catch {
        /* An empty book still lets the artist paint the first pages. */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const completed = useMemo(() => new Set(Object.keys(rows)), [rows]);
  return { profile, rows, savedCounts, loading, completed };
}
