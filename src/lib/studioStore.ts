import { getSceneEntry, isUnlocked } from "@/lib/scenes";
import type { ArtState } from "@/lib/types";

const DB_NAME = "cmw-studio";
const DB_VERSION = 1;

export type ProgressRecord = {
  id: string;
  profileId: string;
  sceneId: string;
  collectionId: string;
  paints: number;
  seconds: number;
  completedAt: string;
};

export type ArtworkRecord = {
  id: string;
  profileId: string;
  title: string;
  sceneId: string;
  collectionId: string;
  thumbnail: string;
  state: ArtState;
  createdAt: string;
};

export type ArtworkSummary = Omit<ArtworkRecord, "state">;

function cleanId(value: unknown, min = 2): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= 80 ? trimmed : null;
}

function safeNumber(value: unknown, max: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Storage request failed"));
  });
}

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("This browser cannot store artwork locally."));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("progress")) {
        const store = db.createObjectStore("progress", { keyPath: "id" });
        store.createIndex("profileId", "profileId", { unique: false });
      }
      if (!db.objectStoreNames.contains("artworks")) {
        const store = db.createObjectStore("artworks", { keyPath: "id" });
        store.createIndex("profileId", "profileId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local storage"));
  });
}

async function readAll<T>(storeName: "progress" | "artworks"): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(storeName, "readonly");
  const rows = await requestToPromise(tx.objectStore(storeName).getAll());
  return rows as T[];
}

async function putRow(storeName: "progress" | "artworks", row: ProgressRecord | ArtworkRecord) {
  const db = await openDb();
  const tx = db.transaction(storeName, "readwrite");
  await requestToPromise(tx.objectStore(storeName).put(row));
}

function savedCountsFor(rows: ArtworkRecord[], profileId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.profileId !== profileId) continue;
    counts[row.sceneId] = (counts[row.sceneId] ?? 0) + 1;
  }
  return counts;
}

export async function loadProgress(profileId: string) {
  const id = cleanId(profileId, 4);
  if (!id) return { completed: [] as ProgressRecord[], savedCounts: {} as Record<string, number> };
  const [progress, artworks] = await Promise.all([
    readAll<ProgressRecord>("progress"),
    readAll<ArtworkRecord>("artworks"),
  ]);
  return {
    completed: progress.filter((row) => row.profileId === id),
    savedCounts: savedCountsFor(artworks, id),
  };
}

export async function saveProgress(input: {
  profileId?: string;
  sceneId?: string;
  collectionId?: string;
  paints?: number;
  seconds?: number;
}) {
  const profileId = cleanId(input.profileId, 4);
  const sceneId = cleanId(input.sceneId, 2);
  const collectionId = cleanId(input.collectionId, 2);
  const entry = sceneId ? getSceneEntry(sceneId) : undefined;
  if (!profileId || !sceneId || !collectionId || !entry || entry.collection.id !== collectionId) {
    return { ok: false as const, error: "A valid profile, page and collection are required" };
  }

  const existing = (await readAll<ProgressRecord>("progress")).filter((row) => row.profileId === profileId);
  if (!isUnlocked(entry, new Set(existing.map((row) => row.sceneId)))) {
    return { ok: false as const, error: "This page has not been unlocked yet" };
  }

  const row: ProgressRecord = {
    id: `${profileId}:${sceneId}`,
    profileId,
    sceneId,
    collectionId,
    paints: safeNumber(input.paints, 999),
    seconds: safeNumber(input.seconds, 86400),
    completedAt: new Date().toISOString(),
  };
  await putRow("progress", row);
  const completed = existing.filter((item) => item.sceneId !== sceneId);
  completed.push(row);
  return { ok: true as const, completed };
}

export async function listArtworks(options: { profileId: string; collectionId?: string | null; page?: number }) {
  const profileId = cleanId(options.profileId, 4);
  const pageSize = 24;
  const rawPage = options.page ?? 1;
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.min(10000, Math.floor(rawPage))) : 1;
  if (!profileId) return { artworks: [] as ArtworkSummary[], total: 0, counts: {}, page: 1, totalPages: 1 };

  const collectionId = options.collectionId ? cleanId(options.collectionId, 2) : null;
  const mine = (await readAll<ArtworkRecord>("artworks"))
    .filter((row) => row.profileId === profileId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const counts: Record<string, number> = {};
  for (const row of mine) counts[row.collectionId] = (counts[row.collectionId] ?? 0) + 1;

  const filtered = collectionId ? mine.filter((row) => row.collectionId === collectionId) : mine;
  const total = filtered.length;
  const artworks = filtered.slice((page - 1) * pageSize, page * pageSize).map(({ state: _state, ...summary }) => summary);
  return { artworks, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)), counts };
}

export async function getArtwork(id: string) {
  const artworkId = cleanId(id, 2);
  if (!artworkId) return null;
  const db = await openDb();
  const tx = db.transaction("artworks", "readonly");
  const row = await requestToPromise(tx.objectStore("artworks").get(artworkId));
  return (row as ArtworkRecord | undefined) ?? null;
}

export async function saveArtwork(input: {
  profileId?: string;
  title?: string;
  sceneId?: string;
  collectionId?: string;
  thumbnail?: string;
  state?: ArtState;
}) {
  const profileId = cleanId(input.profileId, 4);
  const sceneId = cleanId(input.sceneId, 2);
  const collectionId = cleanId(input.collectionId, 2);
  const title = (input.title ?? "").trim().slice(0, 60);
  const thumbnail = typeof input.thumbnail === "string" ? input.thumbnail : "";

  if (!profileId || !sceneId || !collectionId) {
    return { ok: false as const, error: "profileId, sceneId and collectionId are required" };
  }
  if (!title) return { ok: false as const, error: "Give your artwork a title" };
  if (!thumbnail.startsWith("data:image/") || thumbnail.length > 3_000_000) {
    return { ok: false as const, error: "Thumbnail image is missing or too large" };
  }

  const artwork: ArtworkRecord = {
    id: crypto.randomUUID(),
    profileId,
    title,
    sceneId,
    collectionId,
    thumbnail,
    state: {
      fills: input.state?.fills && typeof input.state.fills === "object" ? input.state.fills : {},
      strokes: input.state?.strokes && typeof input.state.strokes === "object" ? input.state.strokes : {},
    },
    createdAt: new Date().toISOString(),
  };

  try {
    await putRow("artworks", artwork);
  } catch {
    return { ok: false as const, error: "This browser is out of room for more saved pictures." };
  }
  return { ok: true as const, artwork };
}

export async function deleteArtwork(id: string, profileId: string) {
  const artworkId = cleanId(id, 2);
  const owner = cleanId(profileId, 4);
  if (!artworkId || !owner) return { ok: false as const, error: "profileId is required" };

  const existing = await getArtwork(artworkId);
  if (!existing || existing.profileId !== owner) return { ok: false as const, error: "Not found" };

  const db = await openDb();
  const tx = db.transaction("artworks", "readwrite");
  await requestToPromise(tx.objectStore("artworks").delete(artworkId));
  return { ok: true as const, id: artworkId };
}

export async function recentArtworks(limit = 6): Promise<ArtworkSummary[]> {
  const rows = await readAll<ArtworkRecord>("artworks");
  return rows
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit)
    .map(({ state: _state, ...summary }) => summary);
}
