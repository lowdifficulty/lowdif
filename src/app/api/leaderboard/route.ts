import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lowdifMintedFromPlays } from "@/lib/display";
import {
  DEMO_ARTIST_LEADERBOARD,
  DEMO_LISTENER_LEADERBOARD,
  mergeLeaderboardRows,
} from "@/lib/demo-leaderboard";
import { resolveUserAvatar } from "@/lib/user-avatar";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        miningRecords: { select: { tokens: true } },
        tracks: { select: { playCount: true, coverUrl: true } },
      },
    });

    const listenerMap = new Map<
      string,
      { id: string; name: string; avatarUrl: string; score: number }
    >();

    for (const u of users) {
      const score = u.miningRecords.reduce((sum, r) => sum + r.tokens, 0);
      if (score <= 0) continue;
      const key = u.name.toLowerCase();
      const row = {
        id: u.id,
        name: u.name,
        avatarUrl: resolveUserAvatar(u.name, u.avatarUrl),
        score,
      };
      const existing = listenerMap.get(key);
      if (!existing || row.score > existing.score) {
        listenerMap.set(key, row);
      }
    }

    const liveListeners = Array.from(listenerMap.values());

    const liveArtists = users
      .filter((u) => u.tracks.length > 0)
      .map((u) => {
        const plays = u.tracks.reduce((sum, t) => sum + t.playCount, 0);
        return {
          id: u.id,
          name: u.name,
          avatarUrl: resolveUserAvatar(u.name, u.avatarUrl),
          score: lowdifMintedFromPlays(plays),
        };
      })
      .filter((row) => row.score > 0);

    const listeners = mergeLeaderboardRows(
      liveListeners,
      DEMO_LISTENER_LEADERBOARD,
      (score) =>
        score % 1 === 0 ? `${score} LOWDIF` : `${score.toFixed(1)} LOWDIF`
    );

    const artists = mergeLeaderboardRows(
      liveArtists,
      DEMO_ARTIST_LEADERBOARD,
      (score) => `${score} LOWDIF Minted`
    );

    return NextResponse.json({ listeners, artists });
  } catch (err) {
    console.error("[leaderboard]", err);
    return NextResponse.json(
      { error: "Leaderboard unavailable." },
      { status: 500 }
    );
  }
}
