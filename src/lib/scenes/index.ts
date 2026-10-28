import type { Collection, Scene } from "../types";
import { animals, vehicles } from "./animals-vehicles";
import { dinos, fantasy } from "./dinos-fantasy";
import { expandCollection } from "./editions";

export const PAGES_PER_COLLECTION = 125;
export const STARTER_PAGES = 3;
export const COLLECTION_UNLOCK_GOAL = 3;
export const COLLECTION_BADGE_GOAL = 10;

/** Original IDs remain unchanged so old progress and saved artwork continue working. */
export const COLLECTIONS: Collection[] = [animals, vehicles, dinos, fantasy].map(expandCollection);

export type SceneEntry = {
  collection: Collection;
  scene: Scene;
  collectionIndex: number;
  sceneIndex: number;
  pageNumber: number;
};

const INDEX: Record<string, SceneEntry> = {};
for (let ci = 0; ci < COLLECTIONS.length; ci++) {
  const col = COLLECTIONS[ci];
  for (let si = 0; si < col.scenes.length; si++) {
    INDEX[col.scenes[si].id] = {
      collection: col,
      scene: col.scenes[si],
      collectionIndex: ci,
      sceneIndex: si,
      pageNumber: ci * PAGES_PER_COLLECTION + si + 1,
    };
  }
}

export const ALL_SCENES: Scene[] = COLLECTIONS.flatMap((collection) => collection.scenes);

/** Interleave themes so all four worlds appear on the first catalog page. */
export const BROWSE_ENTRIES: SceneEntry[] = Array.from({ length: PAGES_PER_COLLECTION }, (_, index) =>
  COLLECTIONS.map((collection) => INDEX[collection.scenes[index].id]),
).flat();

export function getSceneEntry(sceneId: string): SceneEntry | undefined {
  return INDEX[sceneId];
}

export function getScene(sceneId: string): Scene | undefined {
  return INDEX[sceneId]?.scene;
}

export function collectionProgress(collection: Collection, completed: ReadonlySet<string>) {
  const done = collection.scenes.reduce((n, scene) => n + (completed.has(scene.id) ? 1 : 0), 0);
  return { done, total: collection.scenes.length };
}

/** Three completed pictures in the preceding world unlock its neighbour. */
export function isCollectionUnlocked(ci: number, completed: ReadonlySet<string>): boolean {
  if (ci === 0) return true;
  const previous = COLLECTIONS[ci - 1];
  return Boolean(previous && collectionProgress(previous, completed).done >= COLLECTION_UNLOCK_GOAL);
}

/** Every completed picture unwraps another page in its own world. */
export function isUnlocked(entry: SceneEntry, completed: ReadonlySet<string>): boolean {
  if (!isCollectionUnlocked(entry.collectionIndex, completed)) return false;
  if (completed.has(entry.scene.id)) return true;
  const { done } = collectionProgress(entry.collection, completed);
  return entry.sceneIndex < STARTER_PAGES + done;
}

export function lockMessage(entry: SceneEntry, completed: ReadonlySet<string>): string {
  if (!isCollectionUnlocked(entry.collectionIndex, completed)) {
    const previous = COLLECTIONS[entry.collectionIndex - 1];
    const done = previous ? collectionProgress(previous, completed).done : 0;
    const needed = Math.max(0, COLLECTION_UNLOCK_GOAL - done);
    return `Finish ${needed} more ${needed === 1 ? "page" : "pages"} in ${previous?.title ?? "the previous collection"} to unlock ${entry.collection.title}.`;
  }
  const done = collectionProgress(entry.collection, completed).done;
  const needed = Math.max(1, entry.sceneIndex - STARTER_PAGES - done + 1);
  return `Finish ${needed} more ${needed === 1 ? "page" : "pages"} in ${entry.collection.title} to unwrap this one.`;
}

/** Find an actually unlocked unfinished page, preferring the current collection. */
export function nextScene(sceneId: string, completed: ReadonlySet<string>): SceneEntry | undefined {
  const current = INDEX[sceneId];
  if (!current) return undefined;
  const ordered = [
    ...current.collection.scenes.slice(current.sceneIndex + 1),
    ...current.collection.scenes.slice(0, current.sceneIndex),
    ...COLLECTIONS.filter((collection) => collection.id !== current.collection.id).flatMap((collection) => collection.scenes),
  ];
  for (const scene of ordered) {
    const entry = INDEX[scene.id];
    if (!completed.has(scene.id) && isUnlocked(entry, completed)) return entry;
  }
  return undefined;
}

export function firstUnfinished(completed: ReadonlySet<string>): SceneEntry {
  for (const entry of BROWSE_ENTRIES) {
    if (!completed.has(entry.scene.id) && isUnlocked(entry, completed)) return entry;
  }
  return INDEX[COLLECTIONS[0].scenes[0].id];
}
