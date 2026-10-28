"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COLLECTIONS, COLLECTION_BADGE_GOAL, getScene } from "@/lib/scenes";
import { getProfile } from "@/lib/profile";
import { deleteArtwork, listArtworks } from "@/lib/studioStore";
import { useProgress } from "@/lib/useProgress";
import { downloadDataUrl, imageDataUrlToPng } from "@/lib/export";
import { primeAudio, sfx } from "@/lib/audio";
import { DownloadIcon, GalleryIcon, StarIcon, TrashIcon } from "./Icons";
import { Modal } from "./Dialogs";

type Artwork = {
  id: string;
  title: string;
  sceneId: string;
  collectionId: string;
  thumbnail: string;
  createdAt: string;
};

export function GalleryView() {
  const router = useRouter();
  const { completed } = useProgress();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const profileId = useMemo(() => (typeof window === "undefined" ? "" : getProfile().id), []);

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const data = await listArtworks({
        profileId,
        page,
        collectionId: filter === "all" ? null : filter,
      });
      setArtworks(data.artworks);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setCounts(data.counts ?? {});
      setError(null);
    } catch {
      setError("Saved pictures could not be opened in this browser.");
    } finally {
      setLoading(false);
    }
  }, [profileId, page, filter]);

  useEffect(() => { void load(); }, [load]);

  const shown = artworks;
  const savedTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const opened = artworks.find((art) => art.id === openId) ?? null;

  const downloadArtwork = async (art: Artwork) => {
    try {
      const png = await imageDataUrlToPng(art.thumbnail);
      const name = art.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "artwork";
      downloadDataUrl(png, `${name}.png`);
      sfx.save();
    } catch {
      setError("Could not download this artwork in your browser.");
    }
  };

  const remove = async (id: string) => {
    primeAudio();
    try {
      const data = await deleteArtwork(id, profileId);
      if (!data.ok) throw new Error(data.error);
      setOpenId(null);
      if (artworks.length === 1 && page > 1) setPage(page - 1);
      else await load();
      sfx.click();
    } catch {
      setError("That artwork could not be deleted.");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <section className="panel anim-pop mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
              <GalleryIcon width={26} height={26} /> My gallery
            </h1>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Every saved masterpiece lives here. Re-open one to keep painting, or download the PNG.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display flex items-center gap-1.5 rounded-full border-2 border-ink bg-sunshine px-3 py-1.5 text-sm font-bold">
              <StarIcon width={15} height={15} /> {savedTotal} saved
            </span>
            <button type="button" className="btn bg-cherry px-3 py-2 text-sm text-white" onClick={() => router.push("/play")}>
              Colour something new
            </button>
          </div>
        </div>

        <div className="mt-4 border-t-2 border-dashed border-ink/25 pt-4">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">Badge shelf</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLLECTIONS.map((collection) => {
              const done = collection.scenes.filter((scene) => completed.has(scene.id)).length;
              const earned = done >= COLLECTION_BADGE_GOAL;
              return (
                <span
                  key={collection.id}
                  className="panel-soft flex items-center gap-2 px-3 py-2"
                  style={{ background: earned ? collection.accent : "#fffdf7", opacity: earned ? 1 : 0.62 }}
                >
                  <span className="text-lg">{earned ? collection.emoji : "🔒"}</span>
                  <span>
                    <span className="font-display block text-xs leading-tight font-bold">
                      {collection.title} Champion
                    </span>
                    <span className="block text-[10px] font-bold text-ink/70">
                      {Math.min(done, COLLECTION_BADGE_GOAL)}/{COLLECTION_BADGE_GOAL} pages coloured
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={filter === "all"} onClick={() => { setFilter("all"); setPage(1); }} label={`All (${savedTotal})`} />
          {COLLECTIONS.map((collection) => {
            const count = counts[collection.id] ?? 0;
            return (
              <Chip
                key={collection.id}
                active={filter === collection.id}
                onClick={() => { setFilter(collection.id); setPage(1); }}
                label={`${collection.emoji} ${collection.title} (${count})`}
                tint={collection.accent}
              />
            );
          })}
        </div>
      </section>

      {error ? <p className="panel-soft mt-4 bg-cherry px-4 py-3 text-sm font-bold text-white">{error}</p> : null}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel animate-pulse p-0">
              <div className="aspect-[4/3] w-full bg-paper-deep" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-2/3 rounded bg-paper-deep" />
                <div className="h-3 w-1/2 rounded bg-paper-deep" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !shown.length ? (
        <div className="panel mt-8 p-10 text-center">
          <p className="text-5xl">🖼️</p>
          <h2 className="font-display mt-3 text-2xl font-bold">Nothing on the shelf yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-ink-soft">
            Colour a page, then hit <span className="text-ink">Save to gallery</span> and it will show up right here —
            thumbnail, title and all.
          </p>
          <button type="button" className="btn mt-4 bg-mint px-4 py-2.5" onClick={() => router.push("/play")}>
            Open the paint box
          </button>
        </div>
      ) : null}

      {!loading && shown.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((art, index) => {
            const scene = getScene(art.sceneId);
            return (
              <article
                key={art.id}
                className="panel anim-slide overflow-hidden p-0"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                <button
                  type="button"
                  className="block w-full cursor-zoom-in border-b-[3px] border-ink bg-white"
                  onClick={() => {
                    primeAudio();
                    sfx.click();
                    setOpenId(art.id);
                  }}
                  aria-label={`Open ${art.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={art.thumbnail} alt={art.title} className="block aspect-[4/3] w-full object-cover" />
                </button>
                <div className="p-3">
                  <h3 className="font-display truncate text-lg leading-tight font-bold">{art.title}</h3>
                  <p className="mt-0.5 truncate text-xs font-bold text-ink-soft">
                    {scene ? `${scene.emoji} ${scene.title}` : art.sceneId} ·{" "}
                    {new Date(art.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className="btn bg-sunshine px-2.5 py-1.5 text-xs"
                      onClick={() => router.push(`/play/${art.sceneId}?art=${art.id}`)}
                    >
                      Re-open
                    </button>
                    <button
                      type="button"
                      className="btn bg-[#fffdf7] px-2.5 py-1.5 text-xs"
                      onClick={() => { void downloadArtwork(art); }}
                    >
                      <span className="flex items-center gap-1.5">
                        <DownloadIcon width={14} height={14} /> PNG
                      </span>
                    </button>
                    <button
                      type="button"
                      className="btn bg-cherry px-2.5 py-1.5 text-xs text-white"
                      onClick={() => setPendingDelete(art.id)}
                    >
                      <span className="flex items-center gap-1.5">
                        <TrashIcon width={14} height={14} /> Delete
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!loading && total > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-ink-soft">Showing {(page - 1) * 24 + 1}–{Math.min(page * 24, total)} of {total} saved artworks</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn bg-white px-3 py-2 text-xs" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button>
            <span className="font-display rounded-xl border-2 border-ink bg-paper-deep px-3 py-2 text-xs font-bold">{page} / {totalPages}</span>
            <button type="button" className="btn bg-white px-3 py-2 text-xs" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </div>
      ) : null}

      <Modal open={Boolean(opened)} onClose={() => setOpenId(null)} wide>
        {opened ? (
          <div>
            <div className="overflow-hidden rounded-2xl border-[3px] border-ink bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={opened.thumbnail} alt={opened.title} className="block h-auto w-full" />
            </div>
            <h2 className="font-display mt-4 text-2xl font-bold">{opened.title}</h2>
            <p className="text-sm font-semibold text-ink-soft">
              Saved {new Date(opened.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn bg-mint px-3 py-2 text-sm"
                onClick={() => router.push(`/play/${opened.sceneId}?art=${opened.id}`)}
              >
                Keep colouring this one
              </button>
              <button
                type="button"
                className="btn bg-sunshine px-3 py-2 text-sm"
                onClick={() => { void downloadArtwork(opened); }}
              >
                Download PNG
              </button>
              <button type="button" className="btn bg-cherry px-3 py-2 text-sm text-white" onClick={() => setPendingDelete(opened.id)}>
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <h2 className="font-display text-2xl font-bold">Throw this one away?</h2>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          Deleting removes the saved artwork from your gallery. Your unlocked pages stay unlocked.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="btn bg-[#fffdf7] px-3 py-2 text-sm" onClick={() => setPendingDelete(null)}>
            Keep it
          </button>
          <button
            type="button"
            className="btn bg-cherry px-3 py-2 text-sm text-white"
            onClick={() => pendingDelete && void remove(pendingDelete)}
          >
            Delete forever
          </button>
        </div>
      </Modal>
    </main>
  );
}

function Chip({ active, onClick, label, tint }: { active: boolean; onClick: () => void; label: string; tint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn px-3 py-1.5 text-xs"
      style={{ background: active ? (tint ?? "#FFC93C") : "#fffdf7" }}
    >
      {label}
    </button>
  );
}
