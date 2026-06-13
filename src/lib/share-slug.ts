import { prisma } from "@/lib/db";
import { coverForTitle } from "@/lib/covers";
import type { TrackWithArtist } from "@/lib/types";

export const RESERVED_SHARE_ROOT_SEGMENTS = new Set([
  "login",
  "signup",
  "join",
  "whitepaper",
  "trending",
  "playlists",
  "leaderboard",
  "stats",
  "upload",
  "account",
  "t",
  "users",
  "embed",
  "artist",
  "api",
]);

export function slugifyShareSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildTrackSharePath(track: {
  title: string;
  artist: { name: string };
}): string {
  const artistSlug = slugifyShareSegment(track.artist.name);
  const songSlug = slugifyShareSegment(track.title);
  return `/${artistSlug}/${songSlug}`;
}

export function isTrackSharePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return false;
  return !RESERVED_SHARE_ROOT_SEGMENTS.has(parts[0].toLowerCase());
}

export async function findTrackByShareSlugs(
  artistSlug: string,
  songSlug: string
): Promise<TrackWithArtist | null> {
  const tracks = await prisma.track.findMany({
    include: { artist: { select: { id: true, name: true } } },
  });

  const match = tracks.find(
    (track) =>
      slugifyShareSegment(track.artist.name) === artistSlug &&
      slugifyShareSegment(track.title) === songSlug
  );

  if (!match) return null;

  return {
    id: match.id,
    title: match.title,
    genre: match.genre,
    durationSec: match.durationSec,
    fileUrl: match.fileUrl,
    coverUrl: match.coverUrl ?? coverForTitle(match.title),
    playCount: match.playCount,
    createdAt: match.createdAt.toISOString(),
    artist: match.artist,
  };
}
