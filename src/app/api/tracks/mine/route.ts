import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { coverForTitle } from "@/lib/covers";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tracks = await prisma.track.findMany({
    where: { artistId: session.id },
    include: { artist: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tracks: tracks.map((track) => ({
      ...track,
      coverUrl: track.coverUrl ?? coverForTitle(track.title),
      createdAt: track.createdAt.toISOString(),
    })),
  });
}
