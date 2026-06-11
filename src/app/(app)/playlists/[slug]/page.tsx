"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ShareButton } from "@/components/ShareButton";
import { SharedByBanner } from "@/components/SharedByBanner";
import { TrackGrid } from "@/components/TrackGrid";
import { storeReferral } from "@/lib/share-referral";
import { playlistShareTarget } from "@/lib/share";
import { playlistBySlug } from "@/lib/sample-playlists";
import type { TrackWithArtist } from "@/lib/types";

function PlaylistDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const playlist = playlistBySlug(slug);
  const ref = searchParams.get("ref");

  const [tracks, setTracks] = useState<TrackWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharerName, setSharerName] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    if (!playlist) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tracks");
      const data = await res.json();
      const all: TrackWithArtist[] = data.tracks ?? [];
      const ordered = playlist.trackTitles
        .map((title) => all.find((t) => t.title === title))
        .filter((t): t is TrackWithArtist => Boolean(t));
      setTracks(ordered);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [playlist]);

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

  if (!playlist) {
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
    trackCount: playlist.trackTitles.length,
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
            {playlist.trackTitles.length} tracks
          </p>
          <div className="mt-4">
            <ShareButton target={shareTarget} label="Share playlist" />
          </div>
        </div>
      </div>

      <TrackGrid tracks={tracks} loading={loading} />
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
