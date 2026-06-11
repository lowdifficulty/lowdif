"use client";

import { useEffect, useRef, useState } from "react";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import {
  colorsToGradient,
  sampleCoverColors,
} from "@/lib/sample-cover-colors";
import type { MiningPhase } from "./PlayerProvider";

const DARK_GRADIENT = "linear-gradient(135deg, #000 0%, #000 100%)";

interface ColorPressureOverlayProps {
  coverUrl: string | null;
  progress: number;
  phase: MiningPhase;
  isPlaying: boolean;
}

function computeIntensity(progress: number, phase: MiningPhase): number {
  if (phase === "completing" || phase === "minting") return 1;
  if (phase === "minted") return 1;
  if (phase === "failed") return Math.pow(progress, 2) * 0.35;
  if (phase === "inactive") return 0;

  const p = Math.max(0, Math.min(1, progress));
  return Math.pow(p, 1.45);
}

export function ColorPressureOverlay({
  coverUrl,
  progress,
  phase,
  isPlaying,
}: ColorPressureOverlayProps) {
  const [gradient, setGradient] = useState(DARK_GRADIENT);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const coverEpochRef = useRef(0);

  useEffect(() => {
    coverEpochRef.current += 1;
    setGradient(DARK_GRADIENT);
    setTransitionsEnabled(false);

    if (!coverUrl) return;

    const epoch = coverEpochRef.current;
    let cancelled = false;
    void sampleCoverColors(coverUrl).then((colors) => {
      if (!cancelled && epoch === coverEpochRef.current) {
        setGradient(colorsToGradient(colors));
      }
    });

    const enableTimer = window.setTimeout(() => {
      if (epoch === coverEpochRef.current) setTransitionsEnabled(true);
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(enableTimer);
    };
  }, [coverUrl]);

  const smoothProgress = useSmoothProgress(progress, isPlaying && phase === "active");
  const visualProgress = phase === "active" ? smoothProgress : progress;
  const intensity = computeIntensity(visualProgress, phase);
  const isReleasing = phase === "minted";
  const atMaxPressure = phase === "completing" || phase === "minting";

  const scale = 1.05 + intensity * 0.55;
  const colorOpacity = intensity;
  const saturation = 100 + intensity * 320;
  const blur = Math.max(4, 48 - intensity * 44);
  const vignetteOpacity = Math.max(0.12, 0.9 - intensity * 0.78);
  const edgeFadeOpacity = Math.max(0, 0.7 - intensity * 0.7);
  const layerTransition = transitionsEnabled
    ? "opacity 0.4s ease-out, filter 0.4s ease-out, transform 0.4s ease-out"
    : "none";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      style={{ "--pressure-intensity": intensity } as React.CSSProperties}
    >
      <div
        className="mining-pressure-layer absolute inset-[-20%] bg-cover bg-center"
        style={{
          backgroundImage: gradient,
          opacity: colorOpacity * 0.85,
          filter: `saturate(${saturation}%) blur(${blur}px) brightness(${0.9 + intensity * 0.45})`,
          transform: `scale(${scale * 0.95})`,
          transition: layerTransition,
        }}
      />

      <div
        className="mining-pressure-layer absolute inset-[-35%] bg-cover bg-center mix-blend-screen"
        style={{
          backgroundImage: gradient,
          opacity: colorOpacity * 0.7,
          filter: `saturate(${saturation + 80}%) blur(${blur * 0.6}px) brightness(${0.95 + intensity * 0.5})`,
          transform: `scale(${scale * 1.1}) rotate(${intensity * 4}deg)`,
          transition: layerTransition,
        }}
      />

      <div
        className="mining-pressure-radial absolute inset-0"
        style={{
          backgroundImage: gradient,
          opacity: intensity * 0.8,
          filter: `saturate(${saturation + 120}%) brightness(${1 + intensity * 0.35})`,
          transform: `scale(${0.8 + intensity * 0.9})`,
          transition: layerTransition,
        }}
      />

      <div
        className={`absolute inset-0 ${transitionsEnabled ? "transition-opacity duration-500" : ""}`}
        style={{
          background: `radial-gradient(ellipse at center, transparent ${Math.max(2, 50 - intensity * 48)}%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
        }}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 ${transitionsEnabled ? "transition-opacity duration-500" : ""}`}
        style={{ opacity: edgeFadeOpacity }}
      />

      {isReleasing && <div className="mining-pressure-release absolute inset-0" />}
      {atMaxPressure && (
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 55%)",
            opacity: 0.35 + intensity * 0.2,
          }}
        />
      )}
    </div>
  );
}
