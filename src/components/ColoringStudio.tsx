"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadDataUrl, sceneFileName, svgToDataUrl } from "@/lib/export";
import { toLocalPoint } from "@/lib/geometry";
import { autoPaint, countPainted, samePaint } from "@/lib/paints";
import { getProfile } from "@/lib/profile";
import { getArtwork, loadProgress, saveArtwork, saveProgress } from "@/lib/studioStore";
import { COLLECTIONS, COLLECTION_BADGE_GOAL, collectionProgress, getSceneEntry, isCollectionUnlocked, isUnlocked, lockMessage, nextScene } from "@/lib/scenes";
import type { ArtState, Paint, Stroke } from "@/lib/types";
import { emptyState } from "@/lib/types";
import { isMuted as readMuted, primeAudio, setMuted as writeMuted, sfx } from "@/lib/audio";
import { CelebrateDialog, SaveDialog } from "./Dialogs";
import type { UnlockItem } from "./Dialogs";
import { Confetti, FloatLabel, Ring, Splats } from "./Effects";
import type { Splat } from "./Effects";
import { ArrowLeftIcon, GalleryIcon, HomeIcon, MuteIcon, SoundIcon } from "./Icons";
import { CANVAS_REGION, SceneArt } from "./SceneArt";
import type { Tool } from "./SceneArt";
import { SceneRail } from "./SceneRail";
import { ToolRail } from "./ToolRail";
import { InstallButton } from "./PwaInstall";

type DragMode = "brush" | "erase" | null;
type Toast = { id: number; text: string; tone: "ink" | "cherry" | "mint" };
type Celebrate = { unlocks: UnlockItem[]; badge: string | null; nextLabel: string | null };

const TOOL_HINT: Record<Tool, string> = {
  fill: "Tap any white area to flood it with paint.",
  brush: "Hold and drag — paint stays inside the lines.",
  eraser: "Scrub over an area to wipe it back to white.",
  pick: "Click a colour in the picture to steal it.",
};

export function ColoringStudio({ sceneId, loadArtworkId }: { sceneId: string; loadArtworkId?: string | null }) {
  const entry = getSceneEntry(sceneId);
  const router = useRouter();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const scene = entry?.scene ?? COLLECTIONS[0].scenes[0];
  const total = scene.regions.length;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<ArtState>(emptyState());
  const past = useRef<ArtState[]>([]);
  const future = useRef<ArtState[]>([]);
  const drawRef = useRef<{ regionId: string; el: SVGGraphicsElement; pts: number[] } | null>(null);
  const lastErase = useRef<string | null>(null);
  const comboTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const fxId = useRef(1);
  const celebrated = useRef<Set<string>>(new Set());
  const surpriseRef = useRef<number | null>(null);
  const progressSaveRef = useRef<Promise<void> | null>(null);

  const [state, setState] = useState<ArtState>(emptyState);
  const [, bumpHistory] = useState(0);
  const [tool, setTool] = useState<Tool>("fill");
  const [paint, setPaint] = useState<Paint>({ t: "solid", c: "#FF4D6D" });
  const [brushSize, setBrushSize] = useState(11);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [live, setLive] = useState<{ regionId: string; stroke: Stroke } | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [combo, setCombo] = useState(0);
  const [splats, setSplats] = useState<Splat[]>([]);
  const [ring, setRing] = useState<{ id: number; x: number; y: number; color: string } | null>(null);
  const [floatLabel, setFloatLabel] = useState<{ id: number; x: number; y: number; text: string; color: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [paints, setPaints] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [savedCounts, setSavedCounts] = useState<Record<string, number>>({});
  const [celebrate, setCelebrate] = useState<Celebrate | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [savePreview, setSavePreview] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [muted, setMutedUi] = useState(false);
  const [shaking, setShaking] = useState(false);
  const shakeTimer = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const painted = countPainted(state, scene);
  const finished = painted >= total;
  const pct = Math.round((painted / total) * 100);
  const [profile] = useState(() => (typeof window === "undefined" ? { id: "server", name: "Studio Artist" } : getProfile()));

  const showToast = useCallback((text: string, tone: Toast["tone"] = "ink") => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: fxId.current++, text, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const triggerShake = useCallback(() => {
    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    setShaking(true);
    shakeTimer.current = window.setTimeout(() => setShaking(false), 340);
  }, []);

  const applyState = useCallback((next: ArtState) => {
    past.current.push(stateRef.current);
    if (past.current.length > 90) past.current.shift();
    future.current = [];
    stateRef.current = next;
    setState(next);
    bumpHistory((v) => v + 1);
  }, []);

  const replaceState = useCallback((next: ArtState) => {
    stateRef.current = next;
    setState(next);
    bumpHistory((v) => v + 1);
  }, []);

  /* ---------------------------------------------------------------- loading */
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setMutedUi(readMuted());
    celebrated.current = new Set();
    past.current = [];
    future.current = [];
    replaceState(emptyState());
    setSeconds(0);
    setPaints(0);

    (async () => {
      try {
        const data = await loadProgress(profile.id);
        if (cancelled) return;
        setCompleted(new Set(data.completed.map((row) => row.sceneId)));
        setSavedCounts(data.savedCounts);
      } catch {
        if (!cancelled) showToast("Saved progress could not be opened in this browser.", "cherry");
      }

      if (loadArtworkId) {
        try {
          const artwork = await getArtwork(loadArtworkId);
          if (!cancelled && artwork) {
            replaceState(artwork.state);
            celebrated.current.add(sceneId);
            setBanner(`Loaded “${artwork.title}” from your gallery — keep colouring!`);
            window.setTimeout(() => setBanner(null), 4200);
          }
        } catch {
          if (!cancelled) showToast("That artwork could not be loaded.", "cherry");
        }
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, loadArtworkId]);

  /* ------------------------------------------------------------------ timer */
  useEffect(() => {
    if (finished || !ready) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [finished, ready]);

  /* ------------------------------------------------------------- completion */
  useEffect(() => {
    if (!finished || celebrated.current.has(scene.id) || !ready) return;
    celebrated.current.add(scene.id);

    const previous = new Set(completed);
    const after = new Set(previous).add(scene.id);
    const unlocks: UnlockItem[] = [];

    for (let i = 1; i < COLLECTIONS.length; i++) {
      if (!isCollectionUnlocked(i, previous) && isCollectionUnlocked(i, after)) {
        const collection = COLLECTIONS[i];
        unlocks.push({ label: collection.title, emoji: collection.emoji, kind: "collection" });
      }
    }
    if (entry) {
      const freshPage = entry.collection.scenes.find((candidate) => {
        const item = getSceneEntry(candidate.id);
        return item && !isUnlocked(item, previous) && isUnlocked(item, after);
      });
      if (freshPage) unlocks.push({ label: freshPage.title, emoji: freshPage.emoji, kind: "scene" });
    }
    const doneNow = entry ? collectionProgress(entry.collection, after).done : 0;
    const doneBefore = entry ? collectionProgress(entry.collection, previous).done : 0;
    const badge = entry && doneNow >= COLLECTION_BADGE_GOAL && doneBefore < COLLECTION_BADGE_GOAL
      ? `${entry.collection.emoji} ${entry.collection.title} Champion`
      : null;

    const following = nextScene(scene.id, after);
    setCelebrate({ unlocks, badge, nextLabel: following ? `Next: ${following.scene.title}` : null });
    setCompleted(after);
    setConfetti((n) => n + 1);
    sfx.complete();
    if (unlocks.length) window.setTimeout(() => sfx.unlock(), 700);

    progressSaveRef.current = saveProgress({
      profileId: profile.id,
      sceneId: scene.id,
      collectionId: entry?.collection.id ?? scene.id,
      paints,
      seconds,
    }).then((result) => {
      if (!result.ok) throw new Error(result.error);
    }).catch(() => showToast("Could not save progress in this browser.", "cherry"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, ready]);

  /* ------------------------------------------------------------------- juice */
  const spawnSplats = useCallback((clientX: number, clientY: number, color: string) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = fxId.current++;
    setRing({ id, x, y, color });
    window.setTimeout(() => setRing((current) => (current?.id === id ? null : current)), 640);

    const batch: Splat[] = Array.from({ length: 9 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const power = 24 + Math.random() * 56;
      return {
        id: fxId.current++,
        x: x - 4,
        y: y - 4,
        color,
        dx: Math.cos(angle) * power,
        dy: Math.sin(angle) * power - 12,
        size: 5 + Math.random() * 9,
      };
    });
    setSplats((current) => [...current, ...batch]);
    const batchIds = new Set(batch.map((b) => b.id));
    window.setTimeout(() => setSplats((current) => current.filter((s) => !batchIds.has(s.id))), 700);
  }, []);

  const bumpCombo = useCallback(
    (clientX: number, clientY: number, color: string) => {
      if (comboTimer.current) window.clearTimeout(comboTimer.current);
      comboTimer.current = window.setTimeout(() => setCombo(0), 2400);
      setCombo((current) => {
        const next = current + 1;
        if (next >= 3) {
          const rect = stageRef.current?.getBoundingClientRect();
          if (rect) {
            setFloatLabel({
              id: fxId.current++,
              x: clientX - rect.left,
              y: clientY - rect.top,
              text: next >= 8 ? `${next}× WILD!` : `${next}× combo`,
              color,
            });
            window.setTimeout(() => setFloatLabel(null), 760);
          }
        }
        sfx.splash(Math.min(next, 12));
        return next;
      });
    },
    [],
  );

  /* -------------------------------------------------------------- interactions */
  const fillRegion = useCallback(
    (regionId: string, clientX: number, clientY: number) => {
      const current = stateRef.current;
      if (samePaint(current.fills[regionId], paint)) {
        triggerShake();
        sfx.deny();
        showToast("That area already wears this paint.", "cherry");
        return;
      }
      applyState({ ...current, fills: { ...current.fills, [regionId]: paint } });
      setPaints((n) => n + 1);
      spawnSplats(clientX, clientY, paint.c);
      bumpCombo(clientX, clientY, paint.c);
    },
    [applyState, bumpCombo, paint, showToast, spawnSplats],
  );

  const clearRegion = useCallback(
    (regionId: string) => {
      const current = stateRef.current;
      const hadFill = Boolean(current.fills[regionId]);
      const hadStrokes = (current.strokes[regionId] ?? []).length > 0;
      if (!hadFill && !hadStrokes) return;
      const fills = { ...current.fills };
      const strokes = { ...current.strokes };
      delete fills[regionId];
      delete strokes[regionId];
      applyState({ fills, strokes });
      sfx.click();
    },
    [applyState],
  );

  const onRegionDown = useCallback(
    (regionId: string, event: React.PointerEvent<SVGElement>) => {
      primeAudio();
      if (!entry) return;
      const unlocked = isUnlocked(entry, completed);
      if (!unlocked) {
        sfx.deny();
        triggerShake();
        showToast("This page is still locked.", "cherry");
        return;
      }
      if (regionId === CANVAS_REGION && tool !== "brush") return;
      event.preventDefault();
      const el = event.currentTarget as SVGGraphicsElement;
      const point = toLocalPoint(el, event.clientX, event.clientY);

      if (tool === "brush") {
        const start = point ?? [200, 150];
        drawRef.current = { regionId, el, pts: [start[0], start[1]] };
        setLive({ regionId, stroke: { c: paint.c, w: brushSize, pts: [start[0], start[1]] } });
        setDragMode("brush");
        sfx.brush();
        return;
      }

      if (tool === "eraser") {
        lastErase.current = regionId;
        clearRegion(regionId);
        setDragMode("erase");
        return;
      }

      if (tool === "pick") {
        const picked = stateRef.current.fills[regionId];
        if (!picked) {
          sfx.deny();
          showToast("Nothing to pick up there yet.", "cherry");
          return;
        }
        setPaint(picked);
        setTool("fill");
        sfx.tool();
        showToast(picked.t === "pat" ? `Picked the ${picked.p} pattern.` : `Picked ${picked.c.toUpperCase()}.`);
        return;
      }

      fillRegion(regionId, event.clientX, event.clientY);
    },
    [clearRegion, completed, entry, fillRegion, brushSize, paint.c, showToast, tool],
  );

  /* -------------------------------------------------------------- drag loop */
  useEffect(() => {
    if (!dragMode) return;

    const onMove = (event: PointerEvent) => {
      if (dragMode === "brush") {
        const draw = drawRef.current;
        if (!draw) return;
        const point = toLocalPoint(draw.el, event.clientX, event.clientY);
        if (!point) return;
        const pts = draw.pts;
        const lastX = pts[pts.length - 2];
        const lastY = pts[pts.length - 1];
        if (Math.hypot(point[0] - lastX, point[1] - lastY) < 1.1) return;
        pts.push(point[0], point[1]);
        setLive({ regionId: draw.regionId, stroke: { c: paint.c, w: brushSize, pts: [...pts] } });
        return;
      }

      const target = document.elementFromPoint(event.clientX, event.clientY);
      const regionEl = target?.closest?.("[data-region]");
      const regionId = regionEl?.getAttribute("data-region");
      if (!regionId || regionId === lastErase.current) return;
      lastErase.current = regionId;
      clearRegion(regionId);
    };

    const onUp = () => {
      if (dragMode === "brush") {
        const draw = drawRef.current;
        if (draw && draw.pts.length >= 2) {
          const stroke: Stroke = { c: paint.c, w: brushSize, pts: draw.pts };
          const current = stateRef.current;
          applyState({
            ...current,
            strokes: { ...current.strokes, [draw.regionId]: [...(current.strokes[draw.regionId] ?? []), stroke] },
          });
          setPaints((n) => n + 1);
          sfx.brush();
        }
        drawRef.current = null;
        setLive(null);
      }
      lastErase.current = null;
      setDragMode(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragMode, applyState, brushSize, clearRegion, paint.c]);

  /* --------------------------------------------------------------- commands */
  const undo = useCallback(() => {
    const previous = past.current.pop();
    if (!previous) {
      sfx.deny();
      return;
    }
    future.current.push(stateRef.current);
    stateRef.current = previous;
    setState(previous);
    bumpHistory((v) => v + 1);
    sfx.undo();
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) {
      sfx.deny();
      return;
    }
    past.current.push(stateRef.current);
    stateRef.current = next;
    setState(next);
    bumpHistory((v) => v + 1);
    sfx.undo();
  }, []);

  const clearAll = useCallback(() => {
    if (!painted) {
      sfx.deny();
      showToast("The page is already blank.", "cherry");
      return;
    }
    applyState(emptyState());
    celebrated.current.delete(scene.id);
    setPaints(0);
    setSeconds(0);
    sfx.undo();
    showToast("Fresh page! Start again.");
  }, [applyState, painted, scene.id, showToast]);

  const surprise = useCallback(() => {
    if (!ready || !entry || !isUnlocked(entry, completed)) {
      sfx.deny();
      if (ready && entry) showToast(lockMessage(entry, completed), "cherry");
      return;
    }
    if (surpriseRef.current) window.clearInterval(surpriseRef.current);
    const target = autoPaint(scene);
    past.current.push(stateRef.current);
    future.current = [];
    const order = [...scene.regions].sort(() => Math.random() - 0.5);
    let index = 0;
    const working: ArtState = { fills: {}, strokes: {} };
    replaceState(working);
    surpriseRef.current = window.setInterval(() => {
      const region = order[index++];
      if (!region) {
        if (surpriseRef.current) window.clearInterval(surpriseRef.current);
        surpriseRef.current = null;
        return;
      }
      working.fills[region.id] = target.fills[region.id];
      stateRef.current = { fills: { ...working.fills }, strokes: {} };
      setState(stateRef.current);
      setPaints((n) => n + 1);
      sfx.splash(index % 12);
    }, 70);
  }, [replaceState, scene, entry, completed, ready, showToast]);

  useEffect(() => () => { if (surpriseRef.current) window.clearInterval(surpriseRef.current); }, []);

  const makePreview = useCallback(async (width = 720, format: "image/jpeg" | "image/png" = "image/jpeg") => {
    if (!svgRef.current) return null;
    setHoverRegion(null);
    return svgToDataUrl(svgRef.current, { width, paper: scene.paper, format });
  }, [scene.paper]);

  const openSave = useCallback(async () => {
    if (!ready || !entry || !isUnlocked(entry, completed)) {
      if (ready && entry) showToast(lockMessage(entry, completed), "cherry");
      return;
    }
    primeAudio();
    sfx.tool();
    const count = savedCounts[scene.id] ?? 0;
    setSaveTitle(count ? `${scene.title} #${count + 1}` : scene.title);
    setSaveError(null);
    setSavePreview(null);
    setSaveOpen(true);
    try {
      setSavePreview(await makePreview(720));
    } catch {
      setSaveError("Could not render a preview of this artwork.");
    }
  }, [makePreview, savedCounts, scene.id, scene.title, ready, entry, completed, showToast]);

  const confirmSave = useCallback(async () => {
    if (!entry) return;
    setSaveBusy(true);
    setSaveError(null);
    try {
      const thumbnail = savePreview ?? (await makePreview(720));
      if (!thumbnail) throw new Error("preview");
      const data = await saveArtwork({
        profileId: profile.id,
        title: saveTitle.trim() || scene.title,
        sceneId: scene.id,
        collectionId: entry.collection.id,
        thumbnail,
        state: stateRef.current,
      });
      if (!data.ok) throw new Error(data.error);
      setSaveOpen(false);
      sfx.save();
      setSavedCounts((counts) => ({ ...counts, [scene.id]: (counts[scene.id] ?? 0) + 1 }));
      showToast("Saved to your gallery!", "mint");
      setCelebrate(null);
    } catch (error) {
      setSaveError(error instanceof Error && error.message !== "preview" ? error.message : "Could not save this picture.");
    } finally {
      setSaveBusy(false);
    }
  }, [entry, makePreview, profile.id, savePreview, saveTitle, scene.id, scene.title, showToast]);

  const download = useCallback(async () => {
    if (!ready || !entry || !isUnlocked(entry, completed)) {
      if (ready && entry) showToast(lockMessage(entry, completed), "cherry");
      return;
    }
    primeAudio();
    try {
      const url = await makePreview(1200, "image/png");
      if (!url) throw new Error("no artwork");
      downloadDataUrl(url, sceneFileName(scene, saveTitle || scene.title));
      sfx.save();
      showToast("PNG downloaded — go show someone!", "mint");
    } catch {
      showToast("Download failed in this browser.", "cherry");
      sfx.deny();
    }
  }, [makePreview, scene, saveTitle, showToast, ready, entry, completed]);

  const toggleSound = useCallback(() => {
    const next = !muted;
    setMutedUi(next);
    writeMuted(next);
    if (!next) {
      primeAudio();
      sfx.tool();
    }
  }, [muted]);

  /* -------------------------------------------------------------- shortcuts */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (!ready || !entry || !isUnlocked(entry, completed) || saveOpen || celebrate) return;
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void openSave();
        return;
      }
      switch (event.key) {
        case "1":
          setTool("fill");
          sfx.tool();
          break;
        case "2":
          setTool("brush");
          sfx.tool();
          break;
        case "3":
          setTool("eraser");
          sfx.tool();
          break;
        case "4":
          setTool("pick");
          sfx.tool();
          break;
        case "[":
          setBrushSize((s) => Math.max(3, s - 2));
          break;
        case "]":
          setBrushSize((s) => Math.min(26, s + 2));
          break;
        case "r":
          surprise();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSave, redo, surprise, undo, ready, entry, completed, saveOpen, celebrate]);

  if (!entry) {
    return (
      <main className="grid min-h-screen place-items-center p-8">
        <div className="panel p-8 text-center">
          <h1 className="font-display text-2xl font-bold">That page does not exist.</h1>
          <button type="button" className="btn mt-4 bg-sunshine px-4 py-2" onClick={() => router.push("/play")}>
            Back to the studio
          </button>
        </div>
      </main>
    );
  }

  const hoverLabel = hoverRegion ? scene.regions.find((r) => r.id === hoverRegion)?.label ?? null : null;
  const sceneLocked = ready && !isUnlocked(entry, completed);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen pb-8">
      <Confetti burst={confetti} />

      <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button type="button" className="btn bg-[#fffdf7] p-2" title="Home" aria-label="Home" onClick={() => router.push("/")}>
              <HomeIcon width={18} height={18} />
            </button>
            <button
              type="button"
              className="btn bg-[#fffdf7] p-2"
              title="All colouring pages"
              aria-label="All colouring pages"
              onClick={() => router.push("/play")}
            >
              <ArrowLeftIcon width={18} height={18} />
            </button>
            <button
              type="button"
              className="btn bg-[#fffdf7] p-2"
              title="My gallery"
              aria-label="My gallery"
              onClick={() => router.push("/gallery")}
            >
              <GalleryIcon width={18} height={18} />
            </button>
            <InstallButton compact />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold"
                style={{ background: entry.collection.accent }}
              >
                {entry.collection.emoji} {entry.collection.title}
              </span>
              <h1 className="font-display truncate text-lg leading-tight font-bold sm:text-xl">
                {scene.emoji} {scene.title}
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-white">
                <div
                  className="rainbow-bar h-full transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.max(pct, painted ? 6 : 0)}%` }}
                />
              </div>
              <span className="font-display text-xs font-bold tabular-nums text-ink-soft">
                {painted}/{total}
              </span>
              <span className="font-display hidden text-xs font-bold tabular-nums text-ink-soft sm:inline">
                ⏱ {mm}:{ss}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {combo >= 3 ? (
              <span key={combo} className="anim-pop font-display rounded-full border-2 border-ink bg-bubble px-2.5 py-1 text-xs font-bold">
                {combo}× combo
              </span>
            ) : null}
            <button type="button" className="btn bg-[#fffdf7] p-2" onClick={toggleSound} title={muted ? "Unmute" : "Mute"} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <MuteIcon width={18} height={18} /> : <SoundIcon width={18} height={18} />}
            </button>
            <button type="button" className="btn bg-mint px-3 py-2 text-sm" onClick={() => void openSave()}>
              Save
            </button>
          </div>
        </div>
      </header>

      {banner ? (
        <div className="mx-auto mt-3 max-w-[1560px] px-4">
          <p className="anim-toast panel-soft bg-sunshine px-3 py-2 text-sm font-bold">{banner}</p>
        </div>
      ) : null}

      <main className="mx-auto grid max-w-[1560px] gap-4 p-4 lg:grid-cols-[264px_minmax(0,1fr)_300px] lg:items-start">
        <div className="order-3 lg:order-1 lg:sticky lg:top-[86px] lg:h-[calc(100vh-104px)]">
          <SceneRail
            currentSceneId={scene.id}
            completed={completed}
            savedCounts={savedCounts}
            onSelect={async (id) => {
              sfx.click();
              if (progressSaveRef.current) await progressSaveRef.current;
              router.push(`/play/${id}`);
            }}
            onLocked={(message) => {
              sfx.deny();
              triggerShake();
              showToast(message, "cherry");
            }}
          />
        </div>

        <section className="order-1 lg:order-2">
          <div
            ref={stageRef}
            className={`panel stage-paper relative overflow-hidden ${shaking ? "anim-shake" : ""}`}
            style={{ aspectRatio: "4 / 3" }}
          >
            <SceneArt
              scene={scene}
              state={state}
              uid={uid}
              interactive={ready && !sceneLocked}
              tool={tool}
              hoverRegion={hoverRegion}
              live={live}
              extraPaints={[paint]}
              svgRef={svgRef}
              onRegionDown={onRegionDown}
              onHover={setHoverRegion}
            />
            <Splats splats={splats} />
            <Ring ring={ring} />
            <FloatLabel label={floatLabel} />

            {!ready ? (
              <div className="absolute inset-0 z-40 grid place-items-center bg-paper/80">
                <span className="font-display anim-bob text-lg font-bold">Opening the paint box…</span>
              </div>
            ) : null}

            {sceneLocked ? (
              <div className="absolute inset-0 z-40 grid place-items-center bg-ink/70 p-6 text-center">
                <div className="panel anim-pop max-w-xs p-5">
                  <p className="text-3xl">🔒</p>
                  <h2 className="font-display mt-1 text-xl font-bold">Still wrapped in paper</h2>
                  <p className="mt-1 text-sm font-semibold text-ink-soft">
                    {lockMessage(entry, completed)}
                  </p>
                  <button
                    type="button"
                    className="btn mt-3 bg-sunshine px-3 py-2 text-sm"
                    onClick={() => router.push("/play")}
                  >
                    Pick an open page
                  </button>
                </div>
              </div>
            ) : null}

            <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="rounded-full border-2 border-ink bg-white/90 px-2.5 py-1 text-[11px] font-bold">
                {hoverLabel ?? TOOL_HINT[tool]}
              </span>
              {finished ? (
                <span className="anim-pop rounded-full border-2 border-ink bg-mint px-2.5 py-1 text-[11px] font-bold">
                  ✨ Complete
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="panel-soft flex-1 bg-white px-3 py-2 text-xs leading-snug font-bold text-ink-soft">
              {scene.blurb}
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn bg-[#fffdf7] px-3 py-2 text-xs" onClick={() => void download()}>
                PNG
              </button>
              <button type="button" className="btn bg-[#fffdf7] px-3 py-2 text-xs" onClick={clearAll}>
                Clear page
              </button>
            </div>
          </div>
        </section>

        <div className={`order-2 lg:order-3 lg:sticky lg:top-[86px] lg:h-[calc(100vh-104px)] ${!ready || sceneLocked ? "pointer-events-none opacity-50" : ""}`} inert={!ready || sceneLocked}>
          <ToolRail
            tool={tool}
            paint={paint}
            brushSize={brushSize}
            canUndo={past.current.length > 0}
            canRedo={future.current.length > 0}
            onTool={(next) => {
              setTool(next);
              primeAudio();
              sfx.tool();
            }}
            onPaint={(next) => {
              setPaint(next);
              primeAudio();
              sfx.click();
            }}
            onBrushSize={setBrushSize}
            onUndo={undo}
            onRedo={redo}
            onClear={clearAll}
            onSurprise={surprise}
            onSave={() => void openSave()}
            onDownload={() => void download()}
          />
        </div>
      </main>

      <CelebrateDialog
        open={Boolean(celebrate)}
        scene={scene}
        seconds={seconds}
        paints={paints}
        unlocks={celebrate?.unlocks ?? []}
        collectionBadge={celebrate?.badge ?? null}
        nextLabel={celebrate?.nextLabel ?? null}
        onSave={() => void openSave()}
        onNext={async () => {
          const following = nextScene(scene.id, completed);
          if (progressSaveRef.current) await progressSaveRef.current;
          setCelebrate(null);
          if (following) router.push(`/play/${following.scene.id}`);
        }}
        onKeep={() => setCelebrate(null)}
      />

      <SaveDialog
        open={saveOpen}
        title={saveTitle}
        onTitle={setSaveTitle}
        preview={savePreview}
        busy={saveBusy}
        error={saveError}
        savedCount={savedCounts[scene.id] ?? 0}
        onCancel={() => setSaveOpen(false)}
        onConfirm={() => void confirmSave()}
      />

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
          <p
            key={toast.id}
            className={`anim-toast panel px-4 py-2.5 text-sm font-bold ${
              toast.tone === "cherry" ? "bg-cherry text-white" : toast.tone === "mint" ? "bg-mint" : "bg-[#fffdf7]"
            }`}
          >
            {toast.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}
