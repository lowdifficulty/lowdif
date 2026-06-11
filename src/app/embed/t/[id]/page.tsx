import Link from "next/link";
import { prisma } from "@/lib/db";
import { EmbedPlayer } from "./EmbedPlayer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackEmbedPage({ params }: PageProps) {
  const { id } = await params;

  const track = await prisma.track.findUnique({
    where: { id },
    include: { artist: { select: { name: true } } },
  });

  if (!track) {
    return (
      <div className="flex h-[152px] items-center justify-center bg-black px-4 text-center text-xs text-white/60">
        Track not found
      </div>
    );
  }

  return (
    <div className="flex h-[152px] flex-col justify-between bg-black p-3 text-white">
      <EmbedPlayer
        track={{
          id: track.id,
          title: track.title,
          fileUrl: track.fileUrl,
          coverUrl: track.coverUrl,
          artistName: track.artist.name,
        }}
      />
      <Link
        href={`/t/${track.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[9px] font-bold tracking-widest text-white/50 uppercase transition hover:text-white"
      >
        Listen on LOWDIF →
      </Link>
    </div>
  );
}
