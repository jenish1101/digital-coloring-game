import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColoringStudio } from "@/components/ColoringStudio";
import { getSceneEntry } from "@/lib/scenes";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ sceneId: string }>;
  searchParams: Promise<{ art?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ sceneId: string }> }): Promise<Metadata> {
  const { sceneId } = await params;
  const entry = getSceneEntry(sceneId);
  if (!entry) return { title: "Page not found", robots: { index: false } };
  const title = `Colour the ${entry.scene.title} online`;
  const description = `${entry.collection.title}: ${entry.scene.blurb} Free online colouring page — fill, brush and pattern-paint, then save your art.`;
  return {
    title,
    description,
    alternates: { canonical: `/play/${sceneId}` },
    openGraph: { title, description, url: `/play/${sceneId}` },
    twitter: { title, description },
  };
}

export default async function ScenePage({ params, searchParams }: Props) {
  const { sceneId } = await params;
  const entry = getSceneEntry(sceneId);
  if (!entry) notFound();
  const { art } = await searchParams;
  return <ColoringStudio key={sceneId} sceneId={sceneId} loadArtworkId={art ?? null} />;
}
