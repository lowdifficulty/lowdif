"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlayer } from "@/components/PlayerProvider";
import { formatDuration, lowdifMintedFromPlays } from "@/lib/display";
import type { PublicUserProfile } from "@/lib/public-profile";
import type { TrackWithArtist } from "@/lib/types";

interface PublisherTracksViewProps {
  userId: string;
}

export function PublisherTracksView({ userId }: PublisherTracksViewProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [playableTracks, setPlayableTracks] = useState<TrackWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/users/${userId}/public`).then(async (r) => {
        if (!r.ok) throw new Error("Publisher not found.");
        const data = await r.json();
        return data.profile as PublicUserProfile;
      }),
      fetch(`/api/tracks?artistId=${encodeURIComponent(userId)}`).then(async (r) => {
        if (!r.ok) return [] as TrackWithArtist[];
        const data = await r.json();
        return (data.tracks as TrackWithArtist[]) ?? [];
      }),
    ])
      .then(([loadedProfile, tracks]) => {
        setProfile(loadedProfile);
        const rank = new Map(
          loadedProfile.tracks.map((track, index) => [track.id, index])
        );
        const ordered = [...tracks].sort(
          (a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999)
        );
        setPlayableTracks(ordered);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load catalog.")
      )
      .finally(() => setLoading(false));
  }, [userId]);

  const handlePlay = useCallback(
    (track: TrackWithArtist) => {
      playTrack(track, playableTracks);
    },
    [playTrack, playableTracks]
  );

  const handlePlayAll = useCallback(() => {
    if (playableTracks.length === 0) return;
    playTrack(playableTracks[0], playableTracks);
  }, [playTrack, playableTracks]);

  const trackMeta = useMemo(() => {
    if (!profile) return new Map<string, { lowdifMinted: number; playCount: number }>();
    return new Map(
      profile.tracks.map((track) => [
        track.id,
        { lowdifMinted: track.lowdifMinted, playCount: track.playCount },
      ])
    );
  }, [profile]);

  if (loading) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading catalog…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        {error ?? "Publisher not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/leaderboard"
          className="ld-eyebrow mb-4 inline-block transition hover:text-ld-text"
        >
          ← Leaderboard
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className="h-24 w-24 shrink-0 bg-ld-bg-secondary bg-cover bg-center sm:h-28 sm:w-28"
              style={{ backgroundImage: `url(${profile.avatarUrl})` }}
            />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-ld-text">
                {profile.name}
              </h1>
              <p className="mt-2 text-sm text-ld-text-secondary">
                {playableTracks.length} track
                {playableTracks.length === 1 ? "" : "s"} · sorted by LOWDIF
                minted
              </p>
              <Link
                href={`/users/${profile.id}`}
                className="mt-3 inline-block text-xs font-medium uppercase tracking-widest text-ld-text-muted transition hover:text-ld-text"
              >
                View profile
              </Link>
            </div>
          </div>
          {playableTracks.length > 0 && (
            <button
              type="button"
              onClick={handlePlayAll}
              className="ld-btn-outline shrink-0 px-6 py-3 text-xs hover:border-white hover:bg-white hover:text-black"
            >
              Play all
            </button>
          )}
        </div>
      </div>

      {playableTracks.length === 0 ? (
        <div className="border border-ld-border bg-ld-bg-secondary px-6 py-12 text-center text-sm text-ld-text-secondary">
          No uploads yet.
        </div>
      ) : (
        <ol className="space-y-3">
          {playableTracks.map((track, index) => {
            const meta = trackMeta.get(track.id);
            const lowdifMinted =
              meta?.lowdifMinted ?? lowdifMintedFromPlays(track.playCount);
            const playCount = meta?.playCount ?? track.playCount;
            const isActive = currentTrack?.id === track.id;

            return (
              <li
                key={track.id}
                className={`flex items-center gap-3 border bg-ld-card p-4 transition sm:gap-4 ${
                  isActive
                    ? "border-white/30 ring-1 ring-inset ring-white/20"
                    : "border-ld-border hover:border-ld-border-strong"
                }`}
              >
                <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-ld-text-muted">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isActive && isPlaying) {
                      togglePlay();
                      return;
                    }
                    handlePlay(track);
                  }}
                  aria-label={
                    isActive && isPlaying
                      ? `Playing ${track.title}`
                      : `Play ${track.title}`
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-ld-border-strong bg-ld-bg-secondary text-sm text-ld-text transition hover:border-white hover:bg-white hover:text-black"
                >
                  {isActive && isPlaying ? "❚❚" : "▶"}
                </button>
                <div
                  className="hidden h-14 w-14 shrink-0 bg-cover bg-center sm:block"
                  style={
                    track.coverUrl
                      ? { backgroundImage: `url(${track.coverUrl})` }
                      : undefined
                  }
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/t/${track.id}`}
                    className="truncate font-bold text-ld-text transition hover:underline"
                  >
                    {track.title}
                  </Link>
                  <p className="mt-1 text-xs text-ld-text-secondary">
                    {track.genre}
                    {track.durationSec > 0 &&
                      ` · ${formatDuration(track.durationSec)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ld-text">
                    {lowdifMinted} LOWDIF
                  </p>
                  <p className="mt-1 text-[10px] tracking-widest text-ld-text-muted uppercase">
                    {playCount} plays
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
