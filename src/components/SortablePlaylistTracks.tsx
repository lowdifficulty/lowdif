"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatLowdifMinted } from "@/lib/display";
import { trackShareTarget } from "@/lib/share";
import type { TrackWithArtist } from "@/lib/types";
import { ShareButton } from "./ShareButton";
import { usePlayer } from "./PlayerProvider";

interface SortablePlaylistTracksProps {
  tracks: TrackWithArtist[];
  loading?: boolean;
  canReorder?: boolean;
  onReorder?: (trackIds: string[]) => Promise<void>;
}

function reorderList<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function SortablePlaylistTracks({
  tracks: initialTracks,
  loading,
  canReorder = false,
  onReorder,
}: SortablePlaylistTracksProps) {
  const { currentTrack, playTrack } = usePlayer();
  const [tracks, setTracks] = useState(initialTracks);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!saving && dragIndex === null) {
      setTracks(initialTracks);
    }
  }, [initialTracks, saving, dragIndex]);

  const commitReorder = useCallback(
    async (nextTracks: TrackWithArtist[]) => {
      if (!onReorder) return;
      setSaving(true);
      try {
        await onReorder(nextTracks.map((t) => t.id));
      } finally {
        setSaving(false);
      }
    },
    [onReorder]
  );

  if (loading) {
    return (
      <div className="space-y-px bg-ld-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-ld-card" />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="border border-dashed border-ld-border py-16 text-center text-ld-text-secondary">
        No tracks yet. Use the + button while streaming to add songs here.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {canReorder && (
        <p className="ld-eyebrow text-[10px] text-ld-text-muted">
          Drag tracks to reorder{saving ? " · saving…" : ""}
        </p>
      )}
      <div className="space-y-px bg-ld-border">
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          const isDragging = dragIndex === index;
          const isDropTarget =
            overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <div
              key={track.id}
              draggable={canReorder}
              onDragStart={() => {
                dragIndexRef.current = index;
                setDragIndex(index);
              }}
              onDragEnd={() => {
                dragIndexRef.current = null;
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(e) => {
                if (!canReorder || dragIndexRef.current === null) return;
                e.preventDefault();
                setOverIndex(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIndexRef.current;
                if (from === null || from === index || !canReorder) return;
                const next = reorderList(tracks, from, index);
                setTracks(next);
                setDragIndex(null);
                setOverIndex(null);
                dragIndexRef.current = null;
                void commitReorder(next);
              }}
              className={`flex items-center gap-3 bg-ld-card p-4 transition ${
                isDragging ? "opacity-50" : ""
              } ${isDropTarget ? "ring-1 ring-inset ring-white/40" : ""} ${
                isActive ? "ring-1 ring-inset ring-white/30" : ""
              }`}
            >
              {canReorder && (
                <span
                  className="cursor-grab px-1 text-lg leading-none text-ld-text-muted active:cursor-grabbing"
                  aria-hidden
                >
                  ⠿
                </span>
              )}
              <button
                type="button"
                onClick={() => playTrack(track, tracks)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                  <p className="truncate text-[11px] leading-tight text-ld-text-muted">
                    {formatLowdifMinted(track.playCount)}
                  </p>
                </div>
              </button>
              <ShareButton
                target={trackShareTarget(track)}
                compact
                className="flex h-9 w-9 shrink-0 items-center justify-center text-xs text-ld-text-secondary transition hover:text-white"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
