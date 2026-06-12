import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { buildShareMessage, getAppOrigin } from "@/lib/share";
import { ShareLanding } from "./ShareLanding";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const origin = getAppOrigin();

  const track = await prisma.track.findUnique({
    where: { id },
    include: { artist: { select: { id: true, name: true } } },
  });

  if (!track) {
    return { title: "Track not found — LOWDIF" };
  }

  const title = `${track.title} — ${track.artist.name}`;
  const description = buildShareMessage(
    {
      type: "track",
      track: {
        ...track,
        createdAt: track.createdAt.toISOString(),
        artist: track.artist,
      },
    },
    null
  );
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
      url: `${origin}/t/${track.id}`,
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

export default async function TrackSharePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-ld-text-secondary">
          Loading track…
        </div>
      }
    >
      <ShareLanding trackId={id} />
    </Suspense>
  );
}
