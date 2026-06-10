"use client";

import type { TrackWithArtist } from "@/lib/types";
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
            onClick={() => playTrack(track)}
            className={`group flex gap-4 p-4 text-left transition ${
              isActive
                ? "bg-ld-card-hover ring-1 ring-inset ring-white/30"
                : "bg-ld-card hover:bg-ld-card-hover"
            }`}
          >
            <div
              className="h-16 w-16 shrink-0 bg-ld-bg-secondary"
              style={
                track.coverUrl
                  ? {
                      backgroundImage: `url(${track.coverUrl})`,
                      backgroundSize: "cover",
                    }
                  : undefined
              }
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ld-text">{track.title}</p>
              <p className="truncate text-sm text-ld-text-secondary">
                {track.artist.name}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-ld-text-muted">
                <span>{track.genre}</span>
                <span>·</span>
                <span>{track.playCount} plays</span>
                {track.durationSec > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {Math.floor(track.durationSec / 60)}:
                      {(track.durationSec % 60).toString().padStart(2, "0")}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="self-center text-ld-text-secondary opacity-0 transition group-hover:opacity-100">
              ▶
            </span>
          </button>
        );
      })}
    </div>
  );
}
