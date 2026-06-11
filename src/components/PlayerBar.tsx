"use client";

import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { trackShareTarget } from "@/lib/share";
import { ShareButton } from "./ShareButton";
import { usePlayer } from "./PlayerProvider";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isExpanded,
    progress,
    currentTimeSec,
    miningPhase,
    mineResult,
    togglePlay,
    expand,
  } = usePlayer();

  const barProgress = useSmoothProgress(
    progress,
    isPlaying && miningPhase === "active"
  );

  if (!currentTrack || isExpanded) return null;

  const duration = currentTrack.durationSec || 0;
  const mintLabel =
    miningPhase === "minted"
      ? `+${mineResult?.tokens ?? 1} LOWDIF`
      : miningPhase === "minting"
        ? "Minting…"
        : miningPhase === "active"
          ? `${Math.floor(barProgress * 100)}%`
          : null;

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-40 cursor-pointer border-t border-ld-border bg-ld-bg"
      onClick={expand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") expand();
      }}
      aria-label="Expand player"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <div
          className="h-12 w-12 shrink-0 bg-ld-card"
          style={
            currentTrack.coverUrl
              ? {
                  backgroundImage: `url(${currentTrack.coverUrl})`,
                  backgroundSize: "cover",
                }
              : undefined
          }
        />
        <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          <p className="truncate font-bold text-ld-text">{currentTrack.title}</p>
          <p className="truncate text-sm text-ld-text-secondary">
            {currentTrack.artist.name}
          </p>
          <div className="mt-1 h-1 overflow-hidden bg-ld-border">
            <div
              className="h-full w-full origin-left bg-white will-change-transform"
              style={{ transform: `scaleX(${barProgress})` }}
            />
          </div>
        </div>
        {mintLabel && (
          <span className="hidden text-xs font-bold tracking-widest text-ld-text-secondary uppercase sm:inline">
            {mintLabel}
          </span>
        )}
        <ShareButton
          target={trackShareTarget(currentTrack)}
          compact
          className="hidden h-9 w-9 shrink-0 items-center justify-center border border-ld-border-strong text-xs text-ld-text-secondary transition hover:border-white hover:text-white sm:flex"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-white bg-white text-black transition hover:bg-transparent hover:text-white"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <span className="hidden text-xs text-ld-text-muted sm:inline">
          {formatTime(currentTimeSec)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
