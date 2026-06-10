"use client";

import { useMemo } from "react";
import type { MiningPhase } from "./PlayerProvider";

interface MiningVisualProps {
  progress: number;
  phase: MiningPhase;
  trackTitle: string;
  artistName: string;
  durationSec: number;
  showAd: boolean;
  children: React.ReactNode;
}

const RING_SIZE = 320;
const RING_STROKE = 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const PARTICLE_COUNT = 28;

export function MiningVisual({
  progress,
  phase,
  trackTitle,
  artistName,
  durationSec,
  showAd,
  children,
}: MiningVisualProps) {
  const percent = Math.min(100, Math.round(progress * 100));
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);
  const isComplete = phase === "minted" || phase === "failed";
  const isMinting = phase === "completing" || phase === "minting";
  const showStamp = phase === "minted";
  const showBlock = isMinting || phase === "minted";

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        angle: (i / PARTICLE_COUNT) * Math.PI * 2,
        delay: (i % 7) * 0.15,
        size: 2 + (i % 3),
      })),
    []
  );

  const statusLine = (() => {
    if (phase === "minted") return "Proof accepted";
    if (phase === "failed") return "Proof incomplete";
    if (phase === "minting") return "Stream verified";
    if (phase === "completing") return "Stream verified";
    if (progress >= 0.99) return "Finalizing proof…";
    return `Mining LOWDIF… ${percent}%`;
  })();

  const subLine = (() => {
    if (phase === "minted")
      return "1 LOWDIF minted · 50% to artist · 50% to listener";
    if (phase === "failed")
      return "Complete the full track to mint LOWDIF";
    if (isMinting) return "Minting LOWDIF on-chain…";
    if (progress >= 0.8) return "Complete the track to mint LOWDIF";
    return "Proof of Stream active";
  })();

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-8">
      <div
        className="relative flex items-center justify-center"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        {/* Waveform scanner lines */}
        <div
          className={`mining-scanner pointer-events-none absolute inset-0 ${
            isComplete ? "opacity-20" : "opacity-100"
          }`}
          aria-hidden
        />

        {/* Particles converging on center */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {particles.map((p) => {
            const dist = 42 - progress * 34;
            const x = 50 + Math.cos(p.angle) * dist;
            const y = 50 + Math.sin(p.angle) * dist;
            return (
              <span
                key={p.id}
                className={`mining-particle absolute rounded-full bg-white ${
                  isMinting || isComplete ? "mining-particle-compress" : ""
                }`}
                style={{
                  width: p.size,
                  height: p.size,
                  left: `${x}%`,
                  top: `${y}%`,
                  animationDelay: `${p.delay}s`,
                  opacity: isComplete ? 0.15 : 0.35 + progress * 0.45,
                }}
              />
            );
          })}
        </div>

        {/* Progress ring */}
        <svg
          className="pointer-events-none absolute inset-0 -rotate-90"
          width={RING_SIZE}
          height={RING_SIZE}
          aria-hidden
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={RING_STROKE}
            strokeDasharray="4 8"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="white"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            className={`transition-[stroke-dashoffset] duration-300 ${
              phase === "minted" ? "mining-ring-lock" : ""
            }`}
          />
        </svg>

        {/* Artwork / ad slot */}
        <div
          className={`relative z-10 overflow-hidden bg-black shadow-2xl ${
            showAd ? "ring-2 ring-white/30" : ""
          }`}
          style={{ width: RING_SIZE - 48, height: RING_SIZE - 48 }}
        >
          {children}
        </div>

        {/* Verified stamp */}
        {showStamp && (
          <div className="mining-stamp pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="border-2 border-white px-6 py-2 text-sm font-black tracking-[0.35em] text-white">
              VERIFIED
            </div>
          </div>
        )}
      </div>

      {/* Status copy */}
      <div className="text-center">
        <p className="ld-eyebrow mb-2">{subLine}</p>
        <p className="text-lg font-black tracking-tight text-white">
          {statusLine}
        </p>
      </div>

      {/* Block seal */}
      {showBlock && (
        <div className="w-full max-w-sm border border-ld-border bg-black/60 p-4 text-xs">
          <p className="ld-eyebrow mb-3">Proof block</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-ld-text-secondary">
            <dt className="text-ld-text-muted">Artist</dt>
            <dd className="truncate text-right text-ld-text">{artistName}</dd>
            <dt className="text-ld-text-muted">Track</dt>
            <dd className="truncate text-right text-ld-text">{trackTitle}</dd>
            <dt className="text-ld-text-muted">Duration</dt>
            <dd className="text-right text-ld-text">
              {Math.floor(durationSec / 60)}:
              {(durationSec % 60).toString().padStart(2, "0")}
            </dd>
            <dt className="text-ld-text-muted">Proof</dt>
            <dd className="text-right text-ld-text">
              {phase === "minted" ? "Stream verified" : "Pending"}
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}
