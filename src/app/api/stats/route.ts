import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [totalListens, tokenSum, miningRecords, distinctTracks] =
    await Promise.all([
      prisma.listenEvent.count({
        where: { userId: session.id, completed: true },
      }),
      prisma.miningRecord.aggregate({
        where: { userId: session.id },
        _sum: { tokens: true },
      }),
      prisma.miningRecord.findMany({
        where: { userId: session.id },
        include: {
          listenEvent: {
            include: { track: { select: { title: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.listenEvent.findMany({
        where: { userId: session.id, completed: true },
        distinct: ["trackId"],
        select: { trackId: true },
      }),
    ]);

  const totalTokensEarned = tokenSum._sum.tokens ?? 0;

  if (session.role === "ARTIST") {
    const artistTracks = await prisma.track.findMany({
      where: { artistId: session.id },
      orderBy: { playCount: "desc" },
    });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPlays = await prisma.listenEvent.count({
      where: {
        completed: true,
        track: { artistId: session.id },
        createdAt: { gte: weekAgo },
      },
    });

    return NextResponse.json({
      listener: {
        totalListens,
        totalTokensEarned,
        totalTracksPlayed: distinctTracks.length,
        recentMining: miningRecords.map((record) => ({
          id: record.id,
          txHash: record.txHash,
          tokens: record.tokens,
          trackTitle: record.listenEvent.track.title,
          createdAt: record.createdAt.toISOString(),
        })),
      },
      artist: {
        totalPlays: artistTracks.reduce((sum, t) => sum + t.playCount, 0),
        totalTracks: artistTracks.length,
        topTracks: artistTracks.slice(0, 5).map((t) => ({
          id: t.id,
          title: t.title,
          playCount: t.playCount,
        })),
        recentPlays,
      },
    });
  }

  return NextResponse.json({
    listener: {
      totalListens,
      totalTokensEarned,
      totalTracksPlayed: distinctTracks.length,
      recentMining: miningRecords.map((record) => ({
        id: record.id,
        txHash: record.txHash,
        tokens: record.tokens,
        trackTitle: record.listenEvent.track.title,
        createdAt: record.createdAt.toISOString(),
      })),
    },
    artist: null,
  });
}
