"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ShareButton } from "@/components/ShareButton";
import { SharedByBanner } from "@/components/SharedByBanner";
import { SortablePlaylistTracks } from "@/components/SortablePlaylistTracks";
import { TrackGrid } from "@/components/TrackGrid";
import { MY_PLAYLIST_SLUG } from "@/lib/playlist-constants";
import { storeReferral } from "@/lib/share-referral";
import { playlistShareTarget } from "@/lib/share";
import { playlistBySlug } from "@/lib/sample-playlists";
import type { TrackWithArtist } from "@/lib/types";

interface PlaylistMeta {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  isOwner?: boolean;
}

function PlaylistDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const curated = slug !== MY_PLAYLIST_SLUG ? playlistBySlug(slug) : undefined;
  const isMyPlaylist = slug === MY_PLAYLIST_SLUG;
  const ref = searchParams.get("ref");

  const [playlist, setPlaylist] = useState<PlaylistMeta | null>(
    curated
      ? {
          slug: curated.slug,
          title: curated.title,
          description: curated.description,
          coverUrl: curated.coverUrl,
          trackCount: curated.trackTitles.length,
        }
      : null
  );
  const [tracks, setTracks] = useState<TrackWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sharerName, setSharerName] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    try {
      if (isMyPlaylist) {
        const res = await fetch("/api/playlists/mine", { credentials: "include" });
        if (res.status === 401) {
          setPlaylist(null);
          setTracks([]);
          setNotFound(false);
          return;
        }
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setPlaylist(data.playlist);
        setTracks(data.tracks ?? []);
        return;
      }

      if (!curated) {
        setNotFound(true);
        return;
      }

      const res = await fetch("/api/tracks");
      const data = await res.json();
      const all: TrackWithArtist[] = data.tracks ?? [];
      const ordered = curated.trackTitles
        .map((title) => all.find((t) => t.title === title))
        .filter((t): t is TrackWithArtist => Boolean(t));
      setTracks(ordered);
    } catch {
      setTracks([]);
      if (!isMyPlaylist) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [curated, isMyPlaylist]);

  useEffect(() => {
    void fetchTracks();
  }, [fetchTracks]);

  useEffect(() => {
    if (!ref) return;
    void fetch(`/api/users/${ref}/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const name = data?.user?.name ?? null;
        setSharerName(name);
        storeReferral(ref, name);
      })
      .catch(() => storeReferral(ref));
  }, [ref]);

  const handleReorder = useCallback(async (trackIds: string[]) => {
    const res = await fetch("/api/playlists/mine/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ trackIds }),
    });
    if (!res.ok) {
      await fetchTracks();
    }
  }, [fetchTracks]);

  if (isMyPlaylist && !loading && !playlist) {
    return (
      <div className="py-16 text-center">
        <p className="text-ld-text-secondary">
          Sign in to view and edit My Playlist.
        </p>
        <Link
          href="/login"
          className="ld-btn-primary mt-6 inline-block px-6 py-3 text-[10px]"
        >
          Sign in
        </Link>
        <Link
          href="/playlists"
          className="mt-4 block text-xs font-medium uppercase tracking-widest text-ld-text-secondary hover:text-ld-text"
        >
          ← All playlists
        </Link>
      </div>
    );
  }

  if (notFound || !playlist) {
    return (
      <div className="py-16 text-center">
        <p className="text-ld-text-secondary">Playlist not found.</p>
        <Link
          href="/playlists"
          className="mt-4 inline-block text-xs font-medium uppercase tracking-widest text-ld-text-secondary hover:text-ld-text"
        >
          ← All playlists
        </Link>
      </div>
    );
  }

  const shareTarget = playlistShareTarget({
    slug: playlist.slug,
    title: playlist.title,
    description: playlist.description,
    coverUrl: playlist.coverUrl,
    trackCount: tracks.length || playlist.trackCount,
  });

  return (
    <div className="space-y-8">
      {sharerName && <SharedByBanner sharerName={sharerName} />}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div
          className="h-40 w-40 shrink-0 bg-ld-bg-secondary bg-cover bg-center sm:h-48 sm:w-48"
          style={{ backgroundImage: `url(${playlist.coverUrl})` }}
        />
        <div>
          <Link
            href="/playlists"
            className="ld-eyebrow mb-2 inline-block transition hover:text-ld-text"
          >
            ← Playlists
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-ld-text">
            {playlist.title}
          </h1>
          <p className="mt-2 max-w-xl text-ld-text-secondary">
            {playlist.description}
          </p>
          <p className="mt-2 text-xs text-ld-text-muted">
            {tracks.length} tracks
          </p>
          <div className="mt-4">
            <ShareButton target={shareTarget} label="Share playlist" />
          </div>
        </div>
      </div>

      {isMyPlaylist ? (
        <SortablePlaylistTracks
          tracks={tracks}
          loading={loading}
          canReorder={playlist.isOwner !== false}
          onReorder={handleReorder}
        />
      ) : (
        <TrackGrid tracks={tracks} loading={loading} />
      )}
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-ld-text-secondary">
          Loading playlist…
        </div>
      }
    >
      <PlaylistDetailPage />
    </Suspense>
  );
}
