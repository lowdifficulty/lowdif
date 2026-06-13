import {
  MY_PLAYLIST_DESCRIPTION,
  MY_PLAYLIST_SLUG,
  MY_PLAYLIST_TITLE,
} from "@/lib/playlist-constants";
import { coverForTitle } from "@/lib/covers";
import { prisma } from "@/lib/db";
import type { TrackWithArtist } from "@/lib/types";

export {
  MY_PLAYLIST_DESCRIPTION,
  MY_PLAYLIST_SLUG,
  MY_PLAYLIST_TITLE,
} from "@/lib/playlist-constants";

function mapTrack(
  track: {
    id: string;
    title: string;
    genre: string;
    durationSec: number;
    fileUrl: string;
    coverUrl: string | null;
    playCount: number;
    createdAt: Date;
    artist: { id: string; name: string };
  }
): TrackWithArtist {
  return {
    id: track.id,
    title: track.title,
    genre: track.genre,
    durationSec: track.durationSec,
    fileUrl: track.fileUrl,
    coverUrl: track.coverUrl ?? coverForTitle(track.title),
    playCount: track.playCount,
    createdAt: track.createdAt.toISOString(),
    artist: track.artist,
  };
}

export async function getOrCreateMyPlaylist(userId: string) {
  const existing = await prisma.playlist.findUnique({
    where: { userId_slug: { userId, slug: MY_PLAYLIST_SLUG } },
  });
  if (existing) return existing;

  return prisma.playlist.create({
    data: {
      userId,
      slug: MY_PLAYLIST_SLUG,
      title: MY_PLAYLIST_TITLE,
      description: MY_PLAYLIST_DESCRIPTION,
    },
  });
}

export async function getMyPlaylistWithTracks(userId: string) {
  const playlist = await getOrCreateMyPlaylist(userId);
  const rows = await prisma.playlistTrack.findMany({
    where: { playlistId: playlist.id },
    orderBy: { position: "asc" },
    include: {
      track: {
        include: { artist: { select: { id: true, name: true } } },
      },
    },
  });

  const tracks = rows.map((row) => mapTrack(row.track));
  const coverUrl =
    playlist.coverUrl ?? tracks[0]?.coverUrl ?? "/covers/trip-hop.svg";

  return {
    playlist: {
      slug: MY_PLAYLIST_SLUG,
      title: playlist.title,
      description: playlist.description ?? MY_PLAYLIST_DESCRIPTION,
      coverUrl,
      trackCount: tracks.length,
      isOwner: true,
    },
    tracks,
  };
}

export async function addTrackToMyPlaylist(userId: string, trackId: string) {
  const playlist = await getOrCreateMyPlaylist(userId);

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return { ok: false as const, error: "Track not found." };

  const existing = await prisma.playlistTrack.findUnique({
    where: { playlistId_trackId: { playlistId: playlist.id, trackId } },
  });
  if (existing) {
    return { ok: true as const, added: false, message: "Already in My Playlist." };
  }

  const maxPos = await prisma.playlistTrack.aggregate({
    where: { playlistId: playlist.id },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;

  await prisma.playlistTrack.create({
    data: { playlistId: playlist.id, trackId, position },
  });

  if (!playlist.coverUrl && track.coverUrl) {
    await prisma.playlist.update({
      where: { id: playlist.id },
      data: { coverUrl: track.coverUrl },
    });
  }

  return { ok: true as const, added: true, message: "Added to My Playlist." };
}

export async function removeTrackFromMyPlaylist(userId: string, trackId: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { userId_slug: { userId, slug: MY_PLAYLIST_SLUG } },
  });
  if (!playlist) return { ok: false as const, error: "Playlist not found." };

  const deleted = await prisma.playlistTrack.deleteMany({
    where: { playlistId: playlist.id, trackId },
  });
  if (deleted.count === 0) {
    return { ok: false as const, error: "Track not in playlist." };
  }

  const remaining = await prisma.playlistTrack.findMany({
    where: { playlistId: playlist.id },
    orderBy: { position: "asc" },
    include: { track: { select: { coverUrl: true } } },
  });

  await prisma.$transaction(
    remaining.map((row, index) =>
      prisma.playlistTrack.update({
        where: { id: row.id },
        data: { position: index },
      })
    )
  );

  const nextCover = remaining[0]?.track.coverUrl ?? null;
  await prisma.playlist.update({
    where: { id: playlist.id },
    data: { coverUrl: nextCover },
  });

  return { ok: true as const };
}

export async function reorderMyPlaylist(userId: string, trackIds: string[]) {
  const playlist = await prisma.playlist.findUnique({
    where: { userId_slug: { userId, slug: MY_PLAYLIST_SLUG } },
    include: { tracks: true },
  });
  if (!playlist) return { ok: false as const, error: "Playlist not found." };

  const existingIds = new Set(playlist.tracks.map((t) => t.trackId));
  if (
    trackIds.length !== playlist.tracks.length ||
    trackIds.some((id) => !existingIds.has(id))
  ) {
    return { ok: false as const, error: "Invalid track order." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.playlistTrack.updateMany({
      where: { playlistId: playlist.id },
      data: { position: { increment: 1000 } },
    });

    for (let i = 0; i < trackIds.length; i++) {
      await tx.playlistTrack.update({
        where: {
          playlistId_trackId: { playlistId: playlist.id, trackId: trackIds[i] },
        },
        data: { position: i },
      });
    }
  });

  return { ok: true as const };
}
