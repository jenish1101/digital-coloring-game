"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ALL_SCENES,
  BROWSE_ENTRIES,
  COLLECTIONS,
  COLLECTION_BADGE_GOAL,
  COLLECTION_UNLOCK_GOAL,
  collectionProgress,
  firstUnfinished,
  isCollectionUnlocked,
  isUnlocked,
  lockMessage,
} from "@/lib/scenes";
import { useProgress } from "@/lib/useProgress";
import { sfx, primeAudio } from "@/lib/audio";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockIcon, SparkleIcon, StarIcon } from "./Icons";
import { SceneThumb } from "./SceneThumb";

const PAGE_SIZE = 12;
type StatusFilter = "all" | "open" | "finished";

export function StudioPicker() {
  const router = useRouter();
  const { rows, savedCounts, loading, completed } = useProgress();
  const [collectionId, setCollectionId] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);

  const totalSaved = Object.values(savedCounts).reduce((a, b) => a + b, 0);
  const resume = firstUnfinished(completed);
  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return BROWSE_ENTRIES.filter((entry) => {
      if (collectionId !== "all" && entry.collection.id !== collectionId) return false;
      if (status === "open" && !isUnlocked(entry, completed)) return false;
      if (status === "finished" && !completed.has(entry.scene.id)) return false;
      if (!query) return true;
      return `${entry.scene.title} ${entry.scene.blurb} ${entry.collection.title} ${entry.pageNumber}`
        .toLowerCase()
        .includes(query);
    });
  }, [collectionId, status, search, completed]);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const shown = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalCompleted = Object.keys(rows).filter((id) => BROWSE_ENTRIES.some((entry) => entry.scene.id === id)).length;

  const go = (sceneId: string) => {
    primeAudio();
    sfx.click();
    router.push(`/play/${sceneId}`);
  };

  const chooseCollection = (id: string) => {
    setCollectionId(id);
    setPage(1);
    setNotice(null);
    sfx.click();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <section className="panel anim-pop relative mt-5 overflow-hidden">
        <div className="rainbow-bar h-2 border-b-2 border-ink" />
        <div className="flex flex-wrap items-center gap-5 bg-[#fffdf7] p-5 sm:p-7">
          <div className="min-w-[220px] flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-cherry">Your big book of imagination</p>
            <h1 className="font-display mt-1 text-4xl leading-none font-bold sm:text-5xl">Pick a page<span className="text-cherry">.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed font-semibold text-ink-soft sm:text-base">
              500 little worlds, just waiting for your colours. Finish pages to unwrap more pictures and unlock new collections.
            </p>
            <button type="button" disabled={loading} className="btn mt-4 bg-cherry px-4 py-2.5 text-sm text-white" onClick={() => go(resume.scene.id)}>
              <span className="flex items-center gap-2">
                {loading ? "Opening your book…" : totalCompleted ? "Continue colouring" : "Start with the butterfly"}
                <ArrowRightIcon width={17} height={17} />
              </span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
            <Stat value="500" label="Colouring pages" tint="#FFC93C" icon="📚" />
            <Stat value={String(totalCompleted)} label="Pages finished" tint="#BCEFDA" icon="✨" />
            <Stat value="4" label="Worlds to explore" tint="#E4D7FF" icon="🌈" />
            <Stat value={String(totalSaved)} label="Saved artworks" tint="#FFD7E8" icon="🖼️" />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t-[3px] border-ink bg-paper-deep px-5 py-3 sm:px-7">
          <span className="font-display shrink-0 text-xs font-bold">Your journey</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-label="Pages completed" aria-valuemin={0} aria-valuemax={500} aria-valuenow={totalCompleted}>
            <div className="rainbow-bar h-full transition-[width] duration-700" style={{ width: `${(totalCompleted / ALL_SCENES.length) * 100}%` }} />
          </div>
          <span className="font-display text-xs font-bold tabular-nums">{totalCompleted}/500</span>
        </div>
      </section>

      <section className="mt-8" aria-label="Coloring collections">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Choose your adventure</p>
            <h2 className="font-display mt-1 text-2xl font-bold">Explore the collections</h2>
          </div>
          <p className="text-xs font-bold text-ink-soft">{COLLECTION_UNLOCK_GOAL} finished pages unlock the next world ✨</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {COLLECTIONS.map((collection, ci) => {
            const open = isCollectionUnlocked(ci, completed);
            const { done, total } = collectionProgress(collection, completed);
            const active = collectionId === collection.id;
            return (
              <button
                type="button"
                key={collection.id}
                aria-pressed={active}
                onClick={() => chooseCollection(collection.id)}
                className={`panel-soft group flex items-center gap-2.5 p-3 text-left transition hover:-translate-y-1 ${active ? "ring-4 ring-ink/25" : ""}`}
                style={{ background: active ? collection.accent : "#fffdf7" }}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-ink text-xl" style={{ background: collection.accent }}>
                  {collection.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block truncate text-sm font-bold">{collection.title}</span>
                  <span className="mt-0.5 block text-[11px] font-bold text-ink-soft">{open ? `${done}/${total} finished` : `🔒 Finish ${COLLECTION_UNLOCK_GOAL} in previous`}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-9" aria-label="Browse coloring pages">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Find your next masterpiece</p>
            <h2 className="font-display mt-1 text-2xl font-bold">The colouring book <span className="text-cherry">✳</span></h2>
          </div>
          <span className="font-display rounded-full border-2 border-ink bg-sunshine px-3 py-1 text-xs font-bold">{results.length} {results.length === 1 ? "page" : "pages"}</span>
        </div>

        <div className="panel-soft mt-3 flex flex-wrap items-center gap-2 bg-white p-3">
          <label className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border-2 border-ink/25 bg-paper px-3 py-2 focus-within:border-ink">
            <span aria-hidden="true" className="text-lg leading-none">⌕</span>
            <span className="sr-only">Search all coloring pages</span>
            <input
              type="search"
              placeholder="Search animals, rockets, fairies…"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-ink-soft/70"
            />
          </label>
          <button type="button" className={`filter-chip ${collectionId === "all" ? "filter-chip-active" : ""}`} onClick={() => chooseCollection("all")}>All worlds</button>
          {([ ["all", "All pages"], ["open", "Unlocked"], ["finished", "Finished"] ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              className={`filter-chip ${status === value ? "filter-chip-active" : ""}`}
              onClick={() => { setStatus(value); setPage(1); }}
            >{label}</button>
          ))}
        </div>

        {notice ? (
          <div className="anim-toast mt-3 flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-sunshine px-3 py-2 text-sm font-bold" role="status">
            <span>🔒 {notice}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} className="text-xl leading-none">×</button>
          </div>
        ) : null}

        {shown.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((entry) => {
              const { scene, collection, pageNumber } = entry;
              const open = !loading && isUnlocked(entry, completed);
              const done = Boolean(rows[scene.id]);
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    if (loading) return;
                    if (!open) { sfx.deny(); setNotice(lockMessage(entry, completed)); return; }
                    go(scene.id);
                  }}
                  className="panel group overflow-hidden p-0 text-left transition hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(32,38,61,.92)]"
                  aria-label={`${scene.title}, page ${pageNumber}${open ? "" : ", locked"}`}
                >
                  <span className="relative block aspect-[4/3] w-full overflow-hidden border-b-[3px] border-ink bg-white">
                    <SceneThumb scene={scene} className="h-full w-full" />
                    <span className="font-display absolute top-2 left-2 rounded-lg border-2 border-ink bg-white px-1.5 py-0.5 text-[10px] font-bold">#{String(pageNumber).padStart(3, "0")}</span>
                    {!open ? (
                      <span className="absolute inset-0 grid place-items-center bg-ink/35 text-white">
                        <span className="font-display flex items-center gap-1.5 rounded-full border-2 border-white bg-ink/50 px-2.5 py-1 text-xs font-bold"><LockIcon width={14} height={14} /> Locked</span>
                      </span>
                    ) : null}
                    {done ? <span className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-mint"><CheckIcon width={15} height={15} /></span> : null}
                    {savedCounts[scene.id] ? <span className="font-display absolute bottom-2 left-2 flex items-center gap-1 rounded-full border-2 border-ink bg-bubble px-2 py-0.5 text-[10px] font-bold"><StarIcon width={11} height={11} /> {savedCounts[scene.id]} saved</span> : null}
                  </span>
                  <span className="block p-3">
                    <span className="font-display block truncate text-[10px] font-bold uppercase tracking-wider text-ink-soft">{collection.emoji} {collection.title}</span>
                    <span className="font-display mt-1 block min-h-[2.5rem] text-base leading-tight font-bold">{scene.title}</span>
                    <span className="font-display mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      <span>{scene.regions.length} areas</span><span className="text-ink group-hover:underline">{open ? done ? "Colour again →" : "Let's colour →" : "Keep exploring"}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="panel mt-5 p-10 text-center">
            <p className="text-4xl">🔎</p>
            <h3 className="font-display mt-2 text-xl font-bold">No pages found</h3>
            <p className="mt-1 text-sm font-semibold text-ink-soft">Try another word or show all the worlds.</p>
            <button type="button" className="btn mt-4 bg-sunshine px-4 py-2 text-sm" onClick={() => { setSearch(""); setStatus("all"); setCollectionId("all"); setPage(1); }}>Show all 500 pages</button>
          </div>
        )}

        {results.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-ink-soft">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, results.length)} of {results.length} pages</p>
            <div className="flex items-center gap-2">
              <button type="button" className="btn bg-white p-2" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ArrowLeftIcon width={17} height={17} /></button>
              <span className="font-display rounded-xl border-2 border-ink bg-paper-deep px-3 py-2 text-xs font-bold">{currentPage} / {pageCount}</span>
              <button type="button" className="btn bg-white p-2" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ArrowRightIcon width={17} height={17} /></button>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="panel mt-10 flex flex-wrap items-center gap-4 bg-[#E8DBFF] p-5">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-ink bg-sunshine text-2xl">🏆</span>
        <div className="flex-1"><p className="font-display text-lg font-bold">Collect a little more magic</p><p className="text-sm font-semibold text-ink-soft">Finish {COLLECTION_BADGE_GOAL} pictures in a world to earn its Champion badge. Save your favourites to keep forever.</p></div>
        <SparkleIcon width={24} height={24} />
      </aside>
    </main>
  );
}

function Stat({ icon, label, value, tint }: { icon: string; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border-[3px] border-ink p-2.5 shadow-[3px_3px_0_rgba(32,38,61,.85)]" style={{ background: tint }}>
      <div className="flex items-center gap-2"><span className="text-lg">{icon}</span><span className="font-display text-xl leading-none font-bold tabular-nums">{value}</span></div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink/70">{label}</p>
    </div>
  );
}
