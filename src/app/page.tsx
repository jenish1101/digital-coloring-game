import Link from "next/link";
import { ALL_SCENES, COLLECTIONS, isCollectionUnlocked } from "@/lib/scenes";
import { PALETTE, PATTERNS } from "@/lib/paints";
import { StudioWall } from "@/components/CommunityWall";
import { HeroCanvas } from "@/components/HeroCanvas";
import { PaintBox } from "@/components/PaintBox";
import { SceneThumb } from "@/components/SceneThumb";
import { SiteNav } from "@/components/SiteNav";
import { ArrowRightIcon, CheckIcon, GalleryIcon, LockIcon, StarIcon } from "@/components/Icons";

const STEPS = [
  {
    n: "01",
    title: "Pick a page",
    copy: "Explore 500 playful coloring pages across four imaginative collections, from butterflies to moonlight dragons.",
    tint: "#FFC93C",
  },
  {
    n: "02",
    title: "Load the bucket",
    copy: `Choose from ${PALETTE.length} crayons and ${PATTERNS.length} pattern pots, then tap a region. Paint never leaks past the outline.`,
    tint: "#FF8FC7",
    offset: true,
  },
  {
    n: "03",
    title: "Finish to unlock",
    copy: "Colour every region to unwrap more pages. Finish three pictures to open the next world, and earn a badge at ten.",
    tint: "#2FD6A5",
  },
  {
    n: "04",
    title: "Save the masterpiece",
    copy: "Name it, pin it to your gallery, download a PNG, or re-open it later and keep painting on top.",
    tint: "#3AA7FF",
    offset: true,
  },
];

export default function HomePage() {
  const regionCount = ALL_SCENES.reduce((n, scene) => n + scene.regions.length, 0);

  return (
    <>
      <SiteNav active="home" />

      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <span className="anim-bob absolute top-16 left-[6%] h-16 w-4 rotate-12 rounded-full border-[3px] border-ink bg-cherry" />
          <span className="anim-sparkle absolute top-40 left-[16%] text-3xl">✏️</span>
          <span className="anim-bob absolute right-[8%] bottom-10 h-20 w-5 -rotate-12 rounded-full border-[3px] border-ink bg-sky" />
          <span className="anim-sparkle absolute top-10 right-[22%] text-2xl" style={{ animationDelay: "0.8s" }}>
            🖍️
          </span>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:py-16">
          <div className="anim-slide">
            <p className="font-display inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-sunshine px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] shadow-[3px_3px_0_rgba(32,38,61,.9)]">
              <StarIcon width={14} height={14} /> A colouring studio, not a colouring video
            </p>
            <h1 className="font-display mt-4 text-[clamp(2.6rem,7vw,4.6rem)] leading-[0.92] font-bold">
              Color My
              <span className="relative ml-3 inline-block">
                <span className="relative z-10">World</span>
                <span className="rainbow-bar absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 rounded-full border-[3px] border-ink" />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed font-semibold text-ink-soft">
              Butterflies, rockets, dinosaurs and dragons drawn in thick ink and waiting for paint. Flood a wing with
              sunshine yellow, drop a heart pattern on a dragon belly, scribble a sunset with the brush — then save the
              page to your gallery and unlock the next collection.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/play/butterfly" className="btn bg-cherry px-5 py-3 text-lg text-white">
                <span className="flex items-center gap-2">
                  Start colouring <ArrowRightIcon width={18} height={18} />
                </span>
              </Link>
              <Link href="/play" className="btn bg-[#fffdf7] px-5 py-3 text-lg">
                Browse all pages
              </Link>
              <Link href="/gallery" className="btn bg-mint px-5 py-3 text-lg">
                <span className="flex items-center gap-2">
                  <GalleryIcon width={18} height={18} /> Gallery
                </span>
              </Link>
            </div>

            <dl className="mt-7 flex flex-wrap gap-2">
              {[
                { label: "Collections", value: COLLECTIONS.length, tint: "#FFC93C" },
                { label: "Colouring pages", value: ALL_SCENES.length, tint: "#2FD6A5" },
                { label: "Regions to paint", value: regionCount, tint: "#FF8FC7" },
                { label: "Crayons + patterns", value: PALETTE.length + PATTERNS.length, tint: "#3AA7FF" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="panel-soft px-3 py-2"
                  style={{ background: stat.tint }}
                >
                  <dt className="text-[10px] leading-tight font-bold uppercase tracking-[0.14em] text-ink/70">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-2xl leading-none font-bold tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroCanvas />
        </div>
      </section>

      {/* ---------------------------------------------------------- paint box */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold">Everything inside the paint box</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Four tools, twenty crayons, eight patterns — and a brush that respects the lines.
            </p>
          </div>
          <p className="font-display rounded-full border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold">
            Shortcuts: 1–4 tools · [ ] nib · R surprise · Ctrl+Z undo · Ctrl+S save
          </p>
        </header>
        <PaintBox />
      </section>

      {/* ------------------------------------------------------- collections */}
      <section className="border-y-[3px] border-ink bg-paper-deep/70 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-6">
            <h2 className="font-display text-3xl font-bold">Four worlds. 500 little adventures.</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold text-ink-soft">
              Start in Meadow Friends. Every finished page unwraps another, and three finished pictures open the next
              collection. There is a Champion badge waiting at ten, too!
            </p>
          </header>

          <div className="space-y-4">
            {COLLECTIONS.map((collection, ci) => {
              const open = isCollectionUnlocked(ci, new Set<string>());
              const total = collection.scenes.length;
              return (
                <article
                  key={collection.id}
                  className="panel overflow-hidden p-0"
                  style={{ borderLeft: `12px solid ${collection.accent}` }}
                >
                  <div className="flex flex-wrap items-center gap-4 p-4">
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-ink text-2xl"
                      style={{ background: collection.accent }}
                    >
                      {collection.emoji}
                    </span>
                    <div className="min-w-[200px] flex-1">
                      <h3 className="font-display text-xl leading-tight font-bold">
                        {collection.title}
                        <span className="font-display ml-2 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[11px] font-bold">
                          {open ? "Open now" : "Unlocks after 3 pages"}
                        </span>
                      </h3>
                      <p className="mt-0.5 text-sm font-semibold text-ink-soft">{collection.blurb}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                        {total} pages · unlocks in order
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {collection.scenes.slice(0, 3).map((scene) => (
                        <Link
                          key={scene.id}
                          href={`/play/${scene.id}`}
                          title={scene.title}
                          className="block h-16 w-20 overflow-hidden rounded-lg border-[3px] border-ink bg-white transition hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(32,38,61,.9)]"
                        >
                          <SceneThumb scene={scene} className="h-full w-full" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- steps */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-3xl font-bold">How a page becomes a masterpiece</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className={`panel relative bg-[#fffdf7] p-4 ${step.offset ? "md:mt-10" : ""}`}
            >
              <span
                className="font-display absolute -top-4 -left-3 grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-ink text-lg font-bold shadow-[3px_3px_0_rgba(32,38,61,.9)]"
                style={{ background: step.tint }}
              >
                {step.n}
              </span>
              <h3 className="font-display ml-12 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed font-semibold text-ink-soft">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- wall */}
      <section className="border-t-[3px] border-ink bg-paper-deep/70 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold">The studio wall</h2>
              <p className="mt-1 text-sm font-semibold text-ink-soft">
                Pictures you save in this browser, pinned on the wall.
              </p>
            </div>
            <Link href="/gallery" className="btn bg-[#fffdf7] px-4 py-2 text-sm">
              Open my gallery
            </Link>
          </header>
          <StudioWall />
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-display text-2xl font-bold">Ready when you are.</p>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              {regionCount} regions are still pure white. That is a lot of decisions to make.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/play/butterfly" className="btn bg-cherry px-4 py-2.5 text-white">
              <span className="flex items-center gap-2">
                <CheckIcon width={16} height={16} /> Paint the butterfly
              </span>
            </Link>
            <Link href="/play" className="btn bg-[#fffdf7] px-4 py-2.5">
              <span className="flex items-center gap-2">
                <LockIcon width={16} height={16} /> See what is locked
              </span>
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs font-bold text-ink-soft">
          Color My World · line art drawn as SVG paths · progress and artwork stay in this browser · no accounts, no
          ads, just paint.
        </p>
        <p className="mt-2 text-center text-xs font-bold text-ink-soft">
          Developed &amp; maintained by{" "}
          <span className="font-display rounded-md border-2 border-ink bg-grape px-1.5 py-0.5 text-[10px] text-white">JG</span>{" "}
          <strong className="text-ink">Jenish Gondaliya</strong>
        </p>
      </footer>
    </>
  );
}
