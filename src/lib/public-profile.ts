import { prisma } from "@/lib/db";
import { coverForTitle } from "@/lib/covers";
import { lowdifMintedFromPlays } from "@/lib/display";
import { readGiveShareToArtists } from "@/lib/profile-user";

export interface PublicProfileTrack {
  id: string;
  title: string;
  genre: string;
  durationSec: number;
  playCount: number;
  coverUrl: string | null;
  lowdifMinted: number;
  createdAt: string;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
  giveShareToArtists: boolean;
  memberSince: string;
  tracks: PublicProfileTrack[];
  stats: {
    totalListens: number;
    totalTokensEarned: number;
    totalUploads: number;
    totalPlaysOnUploads: number;
  };
}

export async function fetchPublicProfile(
  userId: string
): Promise<PublicUserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      walletAddress: true,
      createdAt: true,
      tracks: {
        orderBy: { playCount: "desc" },
        select: {
          id: true,
          title: true,
          genre: true,
          durationSec: true,
          playCount: true,
          coverUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) return null;

  const [giveShareToArtists, totalListens, tokenSum] = await Promise.all([
    readGiveShareToArtists(userId),
    prisma.listenEvent.count({
      where: { userId, completed: true },
    }),
    prisma.miningRecord.aggregate({
      where: { userId },
      _sum: { tokens: true },
    }),
  ]);

  const tracks = user.tracks.map((track) => ({
    id: track.id,
    title: track.title,
    genre: track.genre,
    durationSec: track.durationSec,
    playCount: track.playCount,
    coverUrl: track.coverUrl ?? coverForTitle(track.title),
    lowdifMinted: lowdifMintedFromPlays(track.playCount),
    createdAt: track.createdAt.toISOString(),
  }));

  const totalPlaysOnUploads = tracks.reduce((sum, t) => sum + t.playCount, 0);

  return {
    id: user.id,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    walletAddress: user.walletAddress,
    giveShareToArtists,
    memberSince: user.createdAt.toISOString(),
    tracks,
    stats: {
      totalListens,
      totalTokensEarned: tokenSum._sum.tokens ?? 0,
      totalUploads: tracks.length,
      totalPlaysOnUploads,
    },
  };
}
