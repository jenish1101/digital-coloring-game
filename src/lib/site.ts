/** Public site details shared by metadata, the manifest, robots and the sitemap. */
const configured =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const SITE = {
  url: (configured ?? "http://localhost:3000").replace(/\/$/, ""),
  name: "Color My World",
  shortName: "Color My World",
  title: "Color My World — a free online coloring game for kids",
  description:
    "Color My World is a free online coloring game with 500 coloring pages of animals, vehicles, dinosaurs and fantasy worlds. Fill, brush and pattern-paint, unlock new collections, save to your gallery and play offline.",
  author: "Jenish Gondaliya",
  keywords: [
    "coloring game",
    "online coloring",
    "coloring pages",
    "kids coloring",
    "digital coloring book",
    "paint game",
    "animals coloring",
    "dinosaur coloring",
    "free coloring app",
    "Jenish Gondaliya",
  ],
};
