"use client";

import { formatLowdifMinted } from "@/lib/display";
import { trackShareTarget } from "@/lib/share";
import type { TrackWithArtist } from "@/lib/types";
import { ShareButton } from "./ShareButton";
import { usePlayer } from "./PlayerProvider";

interface TrackGridProps {
  tracks: TrackWithArtist[];
  loading?: boolean;
}

export function TrackGrid({ tracks, loading }: TrackGridProps) {
  const { currentTrack, playTrack } = usePlayer();

  if (loading) {
    return (
      <div className="grid gap-px bg-ld-border sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse bg-ld-card" />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="border border-dashed border-ld-border py-16 text-center text-ld-text-secondary">
        No tracks found. Try a different search or check back soon.
      </div>
    );
  }

  return (
    <div className="grid gap-px bg-ld-border sm:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track) => {
        const isActive = currentTrack?.id === track.id;
        return (
          <button
            key={track.id}
            onClick={() => playTrack(track, tracks)}
            className={`group flex items-center gap-3 p-4 text-left transition ${
              isActive
                ? "bg-ld-card-hover ring-1 ring-inset ring-white/30"
                : "bg-ld-card hover:bg-ld-card-hover"
            }`}
          >
            <div
              className="h-[4.5rem] w-[4.5rem] shrink-0 bg-ld-bg-secondary bg-cover bg-center"
              style={
                track.coverUrl
                  ? { backgroundImage: `url(${track.coverUrl})` }
                  : undefined
              }
            />
            <div className="flex min-h-[4.5rem] min-w-0 flex-1 flex-col justify-between py-px">
              <p className="truncate text-sm font-bold leading-tight text-ld-text">
                {track.title}
              </p>
              <p className="truncate text-xs leading-tight text-ld-text-secondary">
                {track.artist.name}
              </p>
              <p className="truncate text-[11px] leading-tight text-ld-text-muted">
                {track.genre}
              </p>
              <div className="flex items-center justify-between gap-2 text-[11px] leading-tight text-ld-text-muted">
                <span className="truncate">{formatLowdifMinted(track.playCount)}</span>
                {track.durationSec > 0 && (
                  <span className="shrink-0 tabular-nums">
                    {Math.floor(track.durationSec / 60)}:
                    {(track.durationSec % 60).toString().padStart(2, "0")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2 self-center opacity-0 transition group-hover:opacity-100">
              <span className="text-ld-text-secondary">▶</span>
              <ShareButton
                target={trackShareTarget(track)}
                compact
                className="flex h-7 w-7 items-center justify-center border border-ld-border-strong text-[10px] text-ld-text-secondary transition hover:border-white hover:text-white"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
