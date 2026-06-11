"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AD_DURATION_MS,
  pickAdVariant,
  type AdVariant,
} from "@/lib/ads";

interface PlayerAdProps {
  /** Stable seed keeps the same creative for one mining completion. */
  seed?: string;
}

function BrandMark({ variant }: { variant: AdVariant }) {
  if (variant.brand === "li-ning") {
    return (
      <span
        className="mb-2 inline-block text-[10px] font-black tracking-[0.5em] text-white/90"
        aria-hidden
      >
        李宁
      </span>
    );
  }
  if (variant.brand === "kalshi") {
    return (
      <span
        className="mb-2 inline-flex h-6 w-6 items-center justify-center border border-current text-[11px] font-black"
        style={{ color: variant.theme.accent }}
        aria-hidden
      >
        K
      </span>
    );
  }
  return (
    <span
      className="mb-2 block text-[9px] tracking-[0.4em] text-white/40 uppercase"
      aria-hidden
    >
      Trident
    </span>
  );
}

export function PlayerAd({ seed }: PlayerAdProps) {
  const variant = useMemo(
    () =>
      pickAdVariant(
        seed
          ? seed.split("").reduce((n, c) => n + c.charCodeAt(0), 0)
          : undefined
      ),
    [seed]
  );

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const next = Date.now() - start;
      if (next >= AD_DURATION_MS) {
        setElapsed(AD_DURATION_MS);
        clearInterval(tick);
        return;
      }
      setElapsed(next);
    }, 50);
    return () => clearInterval(tick);
  }, []);

  const progress = Math.min(1, elapsed / AD_DURATION_MS);
  const phase =
    progress < 0.2
      ? "intro"
      : progress < 0.65
        ? "reveal"
        : progress < 0.9
          ? "tagline"
          : "outro";

  const scale = 1.06 + progress * 0.1;
  const brightness = 0.5 + progress * 0.4;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        className="absolute inset-0 transition-transform duration-[5000ms] ease-out"
        style={{
          background: variant.theme.background,
          transform: `scale(${scale})`,
          filter: `brightness(${brightness})`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: variant.theme.overlay }}
      />

      {variant.brand === "kalshi" && (
        <div
          className="pointer-events-none absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-20 blur-2xl"
          style={{ background: variant.theme.accent }}
          aria-hidden
        />
      )}

      <div className="relative flex h-full flex-col items-center justify-between px-4 py-5 text-white">
        <p className="text-[9px] tracking-[0.35em] text-white/50 uppercase">
          Sponsored · {variant.brandLabel}
        </p>

        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`transition-all duration-700 ${
              phase === "intro" ? "scale-90 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <BrandMark variant={variant} />
            <p
              className={`font-light uppercase ${
                variant.brand === "li-ning"
                  ? "text-2xl font-black tracking-[0.25em] sm:text-3xl"
                  : "text-2xl font-light sm:text-3xl"
              }`}
              style={{ letterSpacing: variant.theme.brandTracking }}
            >
              {variant.brandLabel}
            </p>
            <div
              className="mx-auto mt-2 h-px w-12"
              style={{ background: variant.theme.accentMuted }}
            />
          </div>

          <p
            className={`max-w-[220px] text-[10px] leading-relaxed uppercase transition-all duration-700 ${
              variant.brand === "kalshi" ? "normal-case" : ""
            } ${
              phase === "tagline" || phase === "outro"
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
            style={{
              letterSpacing: variant.theme.taglineTracking,
              color:
                phase === "tagline" || phase === "outro"
                  ? variant.theme.accent
                  : "rgba(255,255,255,0.8)",
            }}
          >
            {variant.tagline}
          </p>
        </div>

        <div className="w-full">
          <div className="h-px w-full bg-white/15">
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress * 100}%`,
                background: variant.theme.progress,
              }}
            />
          </div>
          <p className="mt-2 text-center text-[9px] tracking-widest text-white/40 uppercase">
            {Math.ceil((AD_DURATION_MS - elapsed) / 1000)}s
          </p>
        </div>
      </div>
    </div>
  );
}

export { AD_DURATION_MS };
