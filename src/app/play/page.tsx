import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { StudioPicker } from "@/components/StudioPicker";

export const metadata: Metadata = {
  title: "500 free colouring pages",
  description: "Browse 500 free online colouring pages across four collections — animals, vehicles, dinosaurs and fantasy worlds — and jump back into a page.",
  alternates: { canonical: "/play" },
  openGraph: { url: "/play" },
};

export default function PlayPage() {
  return (
    <>
      <SiteNav active="play" />
      <StudioPicker />
    </>
  );
}
