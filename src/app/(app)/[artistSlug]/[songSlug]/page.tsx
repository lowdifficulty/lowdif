import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildShareMessage, getShareOrigin } from "@/lib/share";
import { buildTrackSharePath, findTrackByShareSlugs } from "@/lib/share-slug";
import { ShareLanding } from "../t/[id]/ShareLanding";

interface PageProps {
  params: Promise<{ artistSlug: string; songSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { artistSlug, songSlug } = await params;
  const track = await findTrackByShareSlugs(artistSlug, songSlug);

  if (!track) {
    return { title: "Track not found — LOWDIF" };
  }

  const origin = getShareOrigin();
  const title = `${track.title} — ${track.artist.name}`;
  const description = buildShareMessage({ type: "track", track }, null);
  const cover = track.coverUrl?.startsWith("http")
    ? track.coverUrl
    : track.coverUrl
      ? `${origin}${track.coverUrl}`
      : undefined;

  return {
    title: `${title} | LOWDIF`,
    description,
    openGraph: {
      title,
      description,
      url: `${origin.replace(/\/$/, "")}${buildTrackSharePath(track)}`,
      siteName: "LOWDIF",
      type: "music.song",
      images: cover ? [{ url: cover, width: 512, height: 512, alt: track.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function TrackShareSlugPage({ params }: PageProps) {
  const { artistSlug, songSlug } = await params;
  const track = await findTrackByShareSlugs(artistSlug, songSlug);

  if (!track) notFound();

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-ld-text-secondary">
          Loading track…
        </div>
      }
    >
      <ShareLanding trackId={track.id} />
    </Suspense>
  );
}
