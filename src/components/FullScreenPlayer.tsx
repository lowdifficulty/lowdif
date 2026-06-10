"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MiningVisual } from "./MiningVisual";
import { usePlayer } from "./PlayerProvider";

const AD_VIDEO_URL = process.env.NEXT_PUBLIC_AD_VIDEO_URL;

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
      className={`flex h-10 w-10 items-center justify-center border transition ${
        active
          ? "border-white bg-white text-black"
          : "border-ld-border-strong text-ld-text-secondary hover:border-white hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function AdPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-ld-card">
      <div className="grid grid-cols-4 gap-1 opacity-40">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="mining-ad-cell h-3 w-3 bg-white"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <p className="ld-eyebrow">Sponsored</p>
    </div>
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
    minimize,
    seek,
    closePlayer,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const adVideoRef = useRef<HTMLVideoElement>(null);

  const showAd =
    miningPhase === "completing" ||
    miningPhase === "minting" ||
    miningPhase === "minted";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUserName(data.user?.name ?? null))
      .catch(() => setUserName(null));
  }, []);

  useEffect(() => {
    if (showAd && adVideoRef.current && AD_VIDEO_URL) {
      adVideoRef.current.play().catch(() => undefined);
    }
  }, [showAd]);

  if (!currentTrack || !isExpanded) return null;

  const duration = currentTrack.durationSec || 0;
  const coverStyle = currentTrack.coverUrl
    ? {
        backgroundImage: `url(${currentTrack.coverUrl})`,
        backgroundSize: "cover" as const,
        backgroundPosition: "center" as const,
      }
    : undefined;

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTrack!.title,
          text: `Listening to ${currentTrack!.title} on LOWDIF`,
          url,
        });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white">
      {/* Artist color canvas — blurred cover behind B&W UI */}
      <div
        className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-50 saturate-150"
        style={coverStyle}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/75" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" aria-hidden />

      {/* Top */}
      <header className="relative z-10 flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <p className="text-lg font-black tracking-tight">LOWDIF</p>
          <p className="mt-3 text-xl font-bold tracking-tight">
            {currentTrack.title}
          </p>
          <p className="text-sm text-ld-text-secondary">
            {currentTrack.artist.name}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                miningPhase === "active" || isPlaying
                  ? "mining-pulse bg-white"
                  : "bg-ld-text-muted"
              }`}
            />
            <p className="ld-eyebrow">Proof of Stream active</p>
          </div>
          {userName && (
            <p className="mt-2 text-xs text-ld-text-muted">{userName}</p>
          )}
        </div>
      </header>

      {/* Center — artwork + mining */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4">
        <MiningVisual
          progress={progress}
          phase={miningPhase}
          trackTitle={currentTrack.title}
          artistName={currentTrack.artist.name}
          durationSec={duration}
          showAd={showAd}
        >
          {/* Album art always frames the center slot */}
          <div className="absolute inset-0" style={coverStyle} />
          <div className="absolute inset-0 bg-black/30" />

          {showAd && (
            <div className="relative z-10 flex h-full w-full items-center justify-center p-3">
              <div className="aspect-square h-full max-h-full w-full max-w-full overflow-hidden border border-white/20 bg-black shadow-lg">
                {AD_VIDEO_URL ? (
                  <video
                    ref={adVideoRef}
                    src={AD_VIDEO_URL}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    loop
                  />
                ) : (
                  <AdPlaceholder />
                )}
              </div>
            </div>
          )}

          {!showAd && !currentTrack.coverUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-ld-text-muted">
              <span className="text-4xl">♪</span>
            </div>
          )}
        </MiningVisual>

        {mineResult?.mined && miningPhase === "minted" && (
          <p className="mt-4 max-w-sm text-center font-mono text-[10px] text-ld-text-muted">
            {mineResult.txHash}
          </p>
        )}

        {mineResult && !mineResult.mined && miningPhase === "failed" && (
          <p className="mt-4 text-center text-sm text-ld-text-secondary">
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
      <footer className="relative z-10 border-t border-ld-border bg-black/80 px-6 py-5 backdrop-blur-sm">
        <div
          ref={progressRef}
          role="slider"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="group mb-4 h-1 cursor-pointer bg-ld-border"
          onClick={handleProgressClick}
        >
          <div
            className="relative h-full bg-white transition-all"
            style={{ width: `${progress * 100}%` }}
          >
            <div className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-0 transition group-hover:opacity-100" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="w-16 text-xs text-ld-text-muted">
            {formatTime(currentTimeSec)}
          </span>

          <div className="flex items-center gap-2">
            <IconButton
              label={liked ? "Unlike" : "Like"}
              active={liked}
              onClick={() => setLiked((v) => !v)}
            >
              {liked ? "♥" : "♡"}
            </IconButton>

            <button
              type="button"
              onClick={togglePlay}
              className="flex h-14 w-14 items-center justify-center border-2 border-white bg-white text-xl text-black transition hover:bg-transparent hover:text-white"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <IconButton
              label={saved ? "Unsave" : "Save"}
              active={saved}
              onClick={() => setSaved((v) => !v)}
            >
              {saved ? "◆" : "◇"}
            </IconButton>
          </div>

          <span className="w-16 text-right text-xs text-ld-text-muted">
            {formatTime(duration)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <IconButton label="Add to playlist" onClick={() => undefined}>
            +
          </IconButton>
          <IconButton label="Share" onClick={() => void handleShare()}>
            ↗
          </IconButton>
          <button
            type="button"
            onClick={minimize}
            className="border border-ld-border-strong px-4 py-2 text-xs font-bold tracking-widest text-ld-text-secondary uppercase transition hover:border-white hover:text-white"
          >
            Minimize
          </button>
          {(miningPhase === "minted" || miningPhase === "failed") && (
            <button
              type="button"
              onClick={closePlayer}
              className="border border-white px-4 py-2 text-xs font-bold tracking-widest text-white uppercase"
            >
              Close
            </button>
          )}
        </div>

        <p className="ld-eyebrow mt-4 text-center">
          {miningPhase === "minted"
            ? "Mint complete"
            : miningPhase === "minting"
              ? "Minting in progress"
              : miningPhase === "completing"
                ? "Stream verified — processing"
                : "Complete the track to mint LOWDIF"}
        </p>
      </footer>
    </div>
  );
}
