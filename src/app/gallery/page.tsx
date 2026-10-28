import type { Metadata } from "next";
import { GalleryView } from "@/components/GalleryView";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "My gallery",
  description: "Every artwork you saved, with thumbnails, re-open links and PNG downloads.",
  alternates: { canonical: "/gallery" },
  openGraph: { url: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <SiteNav active="gallery" />
      <GalleryView />
    </>
  );
}
