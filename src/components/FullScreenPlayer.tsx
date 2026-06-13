"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { ColorPressureOverlay } from "./ColorPressureOverlay";
import { MiningVisual } from "./MiningVisual";
import { usePlayer } from "./PlayerProvider";
import { ShareButton } from "./ShareButton";
import { AddToPlaylistButton } from "./AddToPlaylistButton";
import { VerifiedOverlay } from "./VerifiedOverlay";
import { trackShareTarget } from "@/lib/share";

const CONTROL_BTN =
  "flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14";
const CONTROL_BTN_FILLED = `${CONTROL_BTN} bg-black/50 text-white transition hover:scale-105`;
const CONTROL_ICON = "h-8 w-8 sm:h-9 sm:w-9";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CloseIcon({ className = CONTROL_ICON }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function PlayIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function PauseIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function SkipBackIcon({ className = CONTROL_ICON }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
    </svg>
  );
}

function SkipForwardIcon({ className = CONTROL_ICON }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16 6h2v12h-2V6zM6 6l8.5 6L6 18V6z" />
    </svg>
  );
}

function ShareIcon({ className = CONTROL_ICON }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M7 17L17 7M17 7h-6M17 7v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconButton({
  label,
  onClick,
  active,
  disabled,
  filled,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  filled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${
        filled ? CONTROL_BTN_FILLED : CONTROL_BTN
      } transition disabled:pointer-events-none disabled:opacity-35 ${
        filled
          ? "text-white"
          : active
            ? "text-white"
            : "text-ld-text-secondary hover:text-white"
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

  const [userName, setUserName] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const barProgress = useSmoothProgress(progress, isPlaying && miningPhase === "active");

  const canChangeTrack = miningPhase === "active";

  const handleSkip = useCallback(
    (direction: -1 | 1) => {
      if (!canChangeTrack) return;
      if (direction === -1) skipBack();
      else skipForward();
    },
    [canChangeTrack, skipBack, skipForward]
  );

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
      <header className="relative z-10 flex shrink-0 items-start justify-between gap-3 px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-base font-black tracking-tight sm:text-lg">LOWDIF</p>
          <p className="mt-1 truncate text-base font-bold tracking-tight sm:mt-3 sm:text-xl">
            {currentTrack.title}
          </p>
          <p className="truncate text-xs text-ld-text-secondary sm:text-sm">
            {currentTrack.artist.name}
          </p>
          <div className="mt-2 flex items-center gap-1.5 sm:mt-3">
            <span
              className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                miningPhase === "active" || isPlaying
                  ? "mining-pulse bg-white"
                  : "bg-ld-text-muted"
              }`}
            />
            <p className="ld-eyebrow text-[9px] sm:text-[11px]">Proof active</p>
          </div>
          {userName && (
            <p className="mt-1 hidden text-xs text-ld-text-muted sm:block">{userName}</p>
          )}
        </div>
        <button
          type="button"
          onClick={closePlayer}
          aria-label="Close player"
          className={CONTROL_BTN_FILLED}
        >
          <CloseIcon />
        </button>
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
          <div
            className="absolute inset-0 cursor-pointer bg-black"
            onClick={togglePlay}
            role="button"
            tabIndex={0}
            aria-label={isPlaying ? "Pause" : "Play"}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                togglePlay();
              }
            }}
          >
            {currentTrack.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.coverUrl}
                alt=""
                className="pointer-events-none h-full w-full object-cover object-center"
                draggable={false}
              />
            ) : (
              <span className="pointer-events-none flex h-full w-full items-center justify-center text-4xl text-ld-text-muted">
                ♪
              </span>
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
            <IconButton
              label="Previous track"
              onClick={() => handleSkip(-1)}
              disabled={!canChangeTrack}
            >
              <SkipBackIcon />
            </IconButton>
            <button
              type="button"
              onClick={togglePlay}
              className={CONTROL_BTN_FILLED}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className={CONTROL_ICON} />
              ) : (
                <PlayIcon className={CONTROL_ICON} />
              )}
            </button>
            <IconButton
              label="Next track"
              onClick={() => handleSkip(1)}
              disabled={!canChangeTrack}
            >
              <SkipForwardIcon />
            </IconButton>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <AddToPlaylistButton trackId={currentTrack.id} />
            <ShareButton
              target={trackShareTarget(currentTrack)}
              compact
              className={CONTROL_BTN_FILLED}
            >
              <ShareIcon />
            </ShareButton>
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
