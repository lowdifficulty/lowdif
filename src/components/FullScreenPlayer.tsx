"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { ColorPressureOverlay } from "./ColorPressureOverlay";
import { MiningVisual } from "./MiningVisual";
import { usePlayer } from "./PlayerProvider";
import { ShareButton } from "./ShareButton";
import { VerifiedOverlay } from "./VerifiedOverlay";
import { trackShareTarget } from "@/lib/share";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs transition sm:h-8 sm:w-8 ${
        active
          ? "border-white bg-white text-black"
          : "border-ld-border-strong text-ld-text-secondary hover:border-white hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function FullScreenPlayer() {
  const {
    currentTrack,
    isPlaying,
    isExpanded,
    progress,
    currentTimeSec,
    miningPhase,
    mineResult,
    togglePlay,
    skipBack,
    skipForward,
    minimize,
    seek,
    closePlayer,
    verifiedOverlayVisible,
    dismissVerifiedOverlay,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const barProgress = useSmoothProgress(progress, isPlaying && miningPhase === "active");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUserName(data.user?.name ?? null))
      .catch(() => setUserName(null));
  }, []);

  if (!currentTrack || !isExpanded) return null;

  const duration = currentTrack.durationSec || 0;

  const mintStatus =
    miningPhase === "minted"
      ? "Mint complete"
      : miningPhase === "minting"
        ? "Minting…"
        : "Mine on complete";

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  }

  return (
    <div className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-black text-white">
      <ColorPressureOverlay
        key={currentTrack.id}
        coverUrl={currentTrack.coverUrl}
        progress={progress}
        phase={miningPhase}
        isPlaying={isPlaying}
      />

      {/* Top — compact on mobile */}
      <header className="relative z-10 flex shrink-0 items-start justify-between px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
        <div className="min-w-0 pr-3">
          <p className="text-base font-black tracking-tight sm:text-lg">LOWDIF</p>
          <p className="mt-1 truncate text-base font-bold tracking-tight sm:mt-3 sm:text-xl">
            {currentTrack.title}
          </p>
          <p className="truncate text-xs text-ld-text-secondary sm:text-sm">
            {currentTrack.artist.name}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                miningPhase === "active" || isPlaying
                  ? "mining-pulse bg-white"
                  : "bg-ld-text-muted"
              }`}
            />
            <p className="ld-eyebrow text-[9px] sm:text-[11px]">Proof active</p>
          </div>
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close player"
            className="flex h-8 w-8 items-center justify-center border border-ld-border-strong text-sm text-ld-text-secondary transition hover:border-white hover:text-white"
          >
            ×
          </button>
          {userName && (
            <p className="hidden text-xs text-ld-text-muted sm:block">
              {userName}
            </p>
          )}
        </div>
      </header>

      {/* Center — artwork flexes between header and footer; no overlap */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-4 py-2">
        <MiningVisual
          progress={progress}
          phase={miningPhase}
          trackTitle={currentTrack.title}
          artistName={currentTrack.artist.name}
          durationSec={duration}
          txHash={mineResult?.txHash}
        >
          <div className="absolute inset-0 bg-black">
            {currentTrack.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.coverUrl}
                alt=""
                className="h-full w-full object-cover object-center"
                draggable={false}
              />
            ) : (
              <span className="text-4xl text-ld-text-muted">♪</span>
            )}
          </div>
        </MiningVisual>

        {mineResult && !mineResult.mined && miningPhase === "failed" && (
          <p className="mt-2 max-w-xs text-center text-xs text-ld-text-secondary">
            {mineResult.message}
            {mineResult.message?.toLowerCase().includes("sign in") && (
              <>
                {" "}
                <Link href="/login" className="text-white underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        )}
      </div>

      {/* Bottom controls */}
      <footer className="relative z-10 shrink-0 border-t border-ld-border bg-black/90 px-3 py-2 backdrop-blur-sm sm:px-6 sm:py-3">
        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
          <span className="text-[10px] text-ld-text-muted tabular-nums sm:text-xs">
            {formatTime(currentTimeSec)}
          </span>
          <span className="ld-eyebrow hidden truncate text-[9px] sm:block">
            {mintStatus}
          </span>
          <span className="text-[10px] text-ld-text-muted tabular-nums sm:text-xs">
            {formatTime(duration)}
          </span>
        </div>

        <div
          ref={progressRef}
          role="slider"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="group mb-2 h-[6px] cursor-pointer bg-ld-border sm:mb-3"
          onClick={handleProgressClick}
        >
          <div
            className="h-full w-full origin-left bg-white will-change-transform"
            style={{ transform: `scaleX(${barProgress})` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton label="Previous track" onClick={skipBack}>
              ⏮
            </IconButton>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-white bg-white text-sm text-black transition hover:bg-transparent hover:text-white sm:h-10 sm:w-10"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <IconButton label="Next track" onClick={skipForward}>
              ⏭
            </IconButton>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton
              label={liked ? "Unlike" : "Like"}
              active={liked}
              onClick={() => setLiked((v) => !v)}
            >
              {liked ? "♥" : "♡"}
            </IconButton>
            <IconButton label="Add to playlist" onClick={() => undefined}>
              +
            </IconButton>
            <ShareButton
              target={trackShareTarget(currentTrack)}
              compact
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-ld-border-strong text-xs text-ld-text-secondary transition hover:border-white hover:text-white sm:h-8 sm:w-8"
            />
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between sm:hidden">
          <p className="ld-eyebrow truncate text-[9px]">{mintStatus}</p>
          <button
            type="button"
            onClick={minimize}
            className="text-[9px] font-bold tracking-widest text-ld-text-muted uppercase"
          >
            Min
          </button>
        </div>
      </footer>

      {verifiedOverlayVisible && mineResult?.mined && (
        <VerifiedOverlay
          tokens={mineResult.tokens}
          onContinue={dismissVerifiedOverlay}
        />
      )}
    </div>
  );
}
