import Link from "next/link";
import { GalleryIcon, HomeIcon, PaletteIcon } from "./Icons";
import { InstallButton } from "./PwaInstall";

export function SiteNav({ active }: { active: "home" | "play" | "gallery" }) {
  const link = (href: string, key: "home" | "play" | "gallery", label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`btn flex items-center gap-1.5 px-3 py-1.5 text-sm ${
        active === key ? "bg-sunshine" : "bg-[#fffdf7]"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="font-display flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl border-[3px] border-ink bg-cherry text-white shadow-[3px_3px_0_rgba(32,38,61,.9)]">
            <PaletteIcon width={18} height={18} />
          </span>
          <span>
            Color My World
            <span className="block text-[10px] leading-none font-bold uppercase tracking-[0.18em] text-ink-soft">
              paint studio
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {link("/", "home", "Home", <HomeIcon width={16} height={16} />)}
          {link("/play", "play", "Pages", <PaletteIcon width={16} height={16} />)}
          {link("/gallery", "gallery", "Gallery", <GalleryIcon width={16} height={16} />)}
          <InstallButton />
        </nav>
      </div>
    </header>
  );
}
