import type { MetadataRoute } from "next";
import { ALL_SCENES } from "@/lib/scenes";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/play`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...ALL_SCENES.map((scene) => ({
      url: `${SITE.url}/play/${scene.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
