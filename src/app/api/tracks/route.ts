import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { coverForTitle } from "@/lib/covers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const genre = searchParams.get("genre")?.trim() ?? "";
  const artistId = searchParams.get("artistId")?.trim() ?? "";

  const tracks = await prisma.track.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q } },
                { artist: { name: { contains: q } } },
              ],
            }
          : {},
        genre ? { genre: { equals: genre } } : {},
        artistId ? { artistId } : {},
      ],
    },
    include: {
      artist: { select: { id: true, name: true } },
    },
    orderBy: [{ playCount: "desc" }, { createdAt: "desc" }],
    take: artistId ? 100 : 50,
  });

  return NextResponse.json({
    tracks: tracks.map((track) => ({
      ...track,
      coverUrl: track.coverUrl ?? coverForTitle(track.title),
      createdAt: track.createdAt.toISOString(),
    })),
  });
}
