"use client";

import { useMemo } from "react";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import type { MiningPhase } from "./PlayerProvider";

interface MiningVisualProps {
  progress: number;
  phase: MiningPhase;
  trackTitle: string;
  artistName: string;
  durationSec: number;
  txHash?: string | null;
  children: React.ReactNode;
}

const BORDER_STROKE = 6;
const ART_SIZE = 232;
const FRAME_SIZE = ART_SIZE + BORDER_STROKE * 2;
const PARTICLE_COUNT = 28;
const PROOF_BLOCK_HEIGHT = 132;
const BORDER_PERIMETER = 2 * (ART_SIZE + BORDER_STROKE) * 2;

export function MiningVisual({
  progress,
  phase,
  trackTitle,
  artistName,
  durationSec,
  txHash,
  children,
}: MiningVisualProps) {
  const isComplete = phase === "minted" || phase === "failed";
  const smoothProgress = useSmoothProgress(
    progress,
    phase === "active" && !isComplete
  );
  const visualProgress = phase === "active" ? smoothProgress : progress;
  const percent = Math.min(100, Math.floor(visualProgress * 100));
  const borderOffset = BORDER_PERIMETER * (1 - visualProgress);
  const isMinting = phase === "completing" || phase === "minting";
  const showBlock = isMinting || phase === "minted";
  const borderAnimates = phase !== "active";

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
    if (visualProgress >= 0.99) return "Finalizing proof…";
    return `Mining LOWDIF… ${percent}%`;
  })();

  const subLine = (() => {
    if (phase === "minted")
      return "1 LOWDIF minted · 50% to artist · 50% to listener";
    if (phase === "failed") return "Complete the full track to mint LOWDIF";
    if (isMinting) return "Minting LOWDIF on-chain…";
    if (visualProgress >= 0.8) return "Complete the track to mint LOWDIF";
    return "Proof of Stream active";
  })();

  return (
    <div className="flex min-h-0 w-full max-w-[min(90vw,500px)] flex-1 flex-col items-center">
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="relative aspect-square max-h-full w-[min(100%,min(90vw,500px))]">
          <div
            className={`mining-scanner pointer-events-none absolute inset-0 transition-opacity duration-700 ${
              isComplete ? "opacity-20" : "opacity-100"
            }`}
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {particles.map((p) => {
              const dist = 42 - visualProgress * 34;
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
                    opacity: isComplete ? 0.15 : 0.35 + visualProgress * 0.45,
                  }}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 m-auto aspect-square w-full max-w-full">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${FRAME_SIZE} ${FRAME_SIZE}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <rect
                x={BORDER_STROKE / 2}
                y={BORDER_STROKE / 2}
                width={ART_SIZE + BORDER_STROKE}
                height={ART_SIZE + BORDER_STROKE}
                fill="none"
                stroke="#6b7280"
                strokeWidth={BORDER_STROKE}
              />
              <rect
                x={BORDER_STROKE / 2}
                y={BORDER_STROKE / 2}
                width={ART_SIZE + BORDER_STROKE}
                height={ART_SIZE + BORDER_STROKE}
                fill="none"
                stroke="white"
                strokeWidth={BORDER_STROKE}
                strokeLinecap="square"
                strokeDasharray={BORDER_PERIMETER}
                strokeDashoffset={borderOffset}
                style={{
                  willChange: phase === "active" ? "stroke-dashoffset" : undefined,
                }}
                className={
                  borderAnimates
                    ? `transition-[stroke-dashoffset] duration-500 ease-out ${
                        phase === "minted" ? "mining-ring-lock" : ""
                      }`
                    : phase === "minted"
                      ? "mining-ring-lock"
                      : undefined
                }
              />
            </svg>

            <div
              className="absolute overflow-hidden bg-black shadow-2xl"
              style={{
                left: `${(BORDER_STROKE / FRAME_SIZE) * 100}%`,
                top: `${(BORDER_STROKE / FRAME_SIZE) * 100}%`,
                width: `${(ART_SIZE / FRAME_SIZE) * 100}%`,
                height: `${(ART_SIZE / FRAME_SIZE) * 100}%`,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 w-full shrink-0 pb-[10px] text-center sm:mt-4">
        <p className="ld-eyebrow mb-1 transition-opacity duration-300">{subLine}</p>
        <p className="text-base font-black tracking-tight text-white transition-opacity duration-300 sm:text-lg">
          {statusLine}
        </p>
      </div>

      <div
        className="w-full shrink-0 overflow-hidden transition-[height,margin,opacity] duration-500 ease-in-out"
        style={{
          height: showBlock ? PROOF_BLOCK_HEIGHT : 0,
          marginTop: showBlock ? 12 : 0,
          opacity: showBlock ? 1 : 0,
        }}
        aria-hidden={!showBlock}
      >
        <div className="h-full border border-ld-border bg-black/80 p-3 text-xs">
          <p className="ld-eyebrow mb-2">Proof block</p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-ld-text-secondary">
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
          <p
            className={`mt-2 truncate font-mono text-[9px] text-ld-text-muted transition-opacity duration-300 ${
              txHash && phase === "minted" ? "opacity-100" : "opacity-0"
            }`}
          >
            {txHash ?? "\u00A0"}
          </p>
        </div>
      </div>
    </div>
  );
}
