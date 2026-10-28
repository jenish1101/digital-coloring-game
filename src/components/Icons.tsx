import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 22,
  height: 22,
  ...props,
});

export const BucketIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12 12 5l7 7-6.2 6.2a1.8 1.8 0 0 1-2.6 0L5 13a.8.8 0 0 1 0-1Z" />
    <path d="M8.5 8.5 15 15" />
    <path d="M20 15.5s1.6 2 1.6 3.1a1.6 1.6 0 1 1-3.2 0c0-1.1 1.6-3.1 1.6-3.1Z" />
  </svg>
);

export const BrushIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M15.5 3.5 20.5 8.5 11 18H6v-5Z" />
    <path d="M6 18c-1.5 1-1.5 3-3.5 3 1 0 1.5-.5 2.5-.5S6 21 6 21" />
  </svg>
);

export const EraserIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 15 6-6 7 7-4 4H7Z" />
    <path d="M10 9 14 5l7 7-4 4" />
    <path d="M4 21h16" />
  </svg>
);

export const DropperIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m13 6 5 5" />
    <path d="M11 8 6 13v5h5l5-5" />
    <path d="m15 4 1.5-1.5a2.1 2.1 0 0 1 3 3L18 7" />
  </svg>
);

export const UndoIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8h10a5 5 0 0 1 0 10H8" />
    <path d="m4 8 4-4M4 8l4 4" />
  </svg>
);

export const RedoIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 8H10a5 5 0 0 0 0 10h6" />
    <path d="m20 8-4-4M20 8l-4 4" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const WandIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 19 17 7" />
    <path d="m15 5 4 4" />
    <path d="M8 3v3M6.5 4.5h3M18 15v3M16.5 16.5h3M12 2v2M11 3h2" />
  </svg>
);

export const SaveIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h11l3 3v13H5Z" />
    <path d="M8 4v6h8V4M8 20v-6h8v6" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 21h16" />
  </svg>
);

export const SoundIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9v6h4l5 4V5L8 9Z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
);

export const MuteIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9v6h4l5 4V5L8 9Z" />
    <path d="m17 9 5 6M22 9l-5 6" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 13 5 5L20 6" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3 2.7 5.7 6.3.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.3-.9Z" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const ArrowLeftIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const GalleryIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="m4 17 5-5 4 4 3-2 4 4" />
    <circle cx="9" cy="9" r="1.6" />
  </svg>
);

export const PaletteIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z" />
    <circle cx="8" cy="10" r="1.2" fill="currentColor" />
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
    <circle cx="16" cy="10" r="1.2" fill="currentColor" />
  </svg>
);

export const SparkleIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9Z" />
    <path d="M18 4v3M16.5 5.5h3" />
  </svg>
);

export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 11 9-7 9 7" />
    <path d="M6 10v10h12V10" />
  </svg>
);

export const InstallIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M12 7v7" />
    <path d="m9 11 3 3 3-3" />
    <path d="M10.5 18.5h3" />
  </svg>
);
