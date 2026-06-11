"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  isPreviewGlitchSuppressed,
  markNavGlitchShown,
  registerGlitchTrigger,
} from "@/lib/glitch-controller";
import {
  GLITCH_MACRO_CYCLE_MS,
  GLITCH_NAV_DURATION_MS,
  GLITCH_NAV_FADE_MS,
  GLITCH_NAV_PEAK_MS,
  GLITCH_PREVIEW_DURATION_MS,
  GLITCH_PREVIEW_FADE_MS,
  GLITCH_PREVIEW_PEAK_MS,
  GLITCH_TAKEOVER_DURATION_MS,
  GLITCH_TAKEOVER_ENABLED,
  GLITCH_TAKEOVER_FADE_MS,
  GLITCH_TAKEOVER_PEAK_MS,
  randomPreviewDelayMs,
  randomTakeoverDelayMs,
  type GlitchMode,
} from "@/lib/glitch-takeover";

const ROOT_CLASS = "glitch-takeover-active";
const FADE_CLASS = "glitch-takeover-fading";
const PREVIEW_CLASS = "glitch-takeover-preview";

const MATRIX_CHARS = "01アイウエオカキクケコLOWDIFGPUHASHMINTBLOCK";

function randomMatrixColumn(seed: number): string {
  let out = "";
  for (let i = 0; i < 18; i++) {
    out +=
      MATRIX_CHARS[(seed * 7 + i * 13) % MATRIX_CHARS.length] ?? "0";
  }
  return out;
}

function setGlitchTimingVars(
  peakMs: number,
  fadeMs: number,
  totalMs: number
) {
  const root = document.documentElement;
  root.style.setProperty("--glitch-total-ms", `${totalMs}ms`);
  root.style.setProperty("--glitch-fade-ms", `${fadeMs}ms`);
  root.style.setProperty("--glitch-peak-ms", `${peakMs}ms`);
}

function clearGlitchTimingVars() {
  const root = document.documentElement;
  root.style.removeProperty("--glitch-total-ms");
  root.style.removeProperty("--glitch-fade-ms");
  root.style.removeProperty("--glitch-peak-ms");
}

export function GlitchTakeover() {
  const [active, setActive] = useState(false);
  const [fading, setFading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [rainCols, setRainCols] = useState<number[]>([]);
  const macroTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const majorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modeRef = useRef<"idle" | GlitchMode>("idle");

  const glitchTiming = useCallback((mode: GlitchMode) => {
    if (mode === "full") {
      return {
        peakMs: GLITCH_TAKEOVER_PEAK_MS,
        fadeMs: GLITCH_TAKEOVER_FADE_MS,
        durationMs: GLITCH_TAKEOVER_DURATION_MS,
        rainCount: 14,
        preview: false,
      };
    }
    if (mode === "nav") {
      return {
        peakMs: GLITCH_NAV_PEAK_MS,
        fadeMs: GLITCH_NAV_FADE_MS,
        durationMs: GLITCH_NAV_DURATION_MS,
        rainCount: 7,
        preview: true,
      };
    }
    return {
      peakMs: GLITCH_PREVIEW_PEAK_MS,
      fadeMs: GLITCH_PREVIEW_FADE_MS,
      durationMs: GLITCH_PREVIEW_DURATION_MS,
      rainCount: 9,
      preview: true,
    };
  }, []);

  const endTakeover = useCallback(() => {
    document.documentElement.classList.remove(
      ROOT_CLASS,
      FADE_CLASS,
      PREVIEW_CLASS
    );
    clearGlitchTimingVars();
    modeRef.current = "idle";
    setFading(false);
    setIsPreview(false);
    setActive(false);
  }, []);

  const triggerTakeover = useCallback(
    (mode: GlitchMode) => {
      if (mode === "preview" && isPreviewGlitchSuppressed()) return;
      if (mode !== "full" && modeRef.current === "full") return;
      if (mode === "full" && modeRef.current !== "idle") {
        endTakeover();
      }
      if (mode === "preview" && modeRef.current === "preview") return;
      if (mode === "nav") markNavGlitchShown();

      if (fadeRef.current) clearTimeout(fadeRef.current);
      if (endRef.current) clearTimeout(endRef.current);

      const { peakMs, fadeMs, durationMs, rainCount, preview } =
        glitchTiming(mode);

      setRainCols(
        Array.from(
          { length: rainCount },
          (_, i) => i + Math.floor(Math.random() * 40)
        )
      );
      setGlitchTimingVars(peakMs, fadeMs, durationMs);
      document.documentElement.classList.remove(FADE_CLASS, PREVIEW_CLASS);
      if (preview) {
        document.documentElement.classList.add(PREVIEW_CLASS);
      }
      document.documentElement.classList.add(ROOT_CLASS);
      modeRef.current = mode;
      setIsPreview(preview);
      setFading(false);
      setActive(true);

      fadeRef.current = setTimeout(() => {
        document.documentElement.classList.add(FADE_CLASS);
        setFading(true);
      }, peakMs);

      endRef.current = setTimeout(() => {
        endTakeover();
      }, durationMs);
    },
    [endTakeover, glitchTiming]
  );

  useEffect(() => {
    if (!GLITCH_TAKEOVER_ENABLED) return;
    return registerGlitchTrigger(triggerTakeover);
  }, [triggerTakeover]);

  useEffect(() => {
    if (!GLITCH_TAKEOVER_ENABLED) return;

    const clearCycleTimers = () => {
      if (macroTimeoutRef.current) clearTimeout(macroTimeoutRef.current);
      macroTimeoutRef.current = null;
      if (majorTimeoutRef.current) clearTimeout(majorTimeoutRef.current);
      majorTimeoutRef.current = null;
      for (const id of previewTimeoutsRef.current) clearTimeout(id);
      previewTimeoutsRef.current = [];
    };

    const startMacroCycle = () => {
      clearCycleTimers();
      const cycleEndsAt = Date.now() + GLITCH_MACRO_CYCLE_MS;

      const schedulePreview = () => {
        const remaining = cycleEndsAt - Date.now();
        if (remaining <= 0) return;

        const delay = Math.min(randomPreviewDelayMs(), remaining);
        const id = setTimeout(() => {
          if (Date.now() < cycleEndsAt) triggerTakeover("preview");
          schedulePreview();
        }, delay);
        previewTimeoutsRef.current.push(id);
      };
      schedulePreview();

      const majorDelay = Math.min(randomTakeoverDelayMs(), GLITCH_MACRO_CYCLE_MS);
      majorTimeoutRef.current = setTimeout(() => {
        if (Date.now() < cycleEndsAt) triggerTakeover("full");
      }, majorDelay);

      macroTimeoutRef.current = setTimeout(() => {
        startMacroCycle();
      }, GLITCH_MACRO_CYCLE_MS);
    };

    startMacroCycle();

    return () => {
      clearCycleTimers();
      if (fadeRef.current) clearTimeout(fadeRef.current);
      if (endRef.current) clearTimeout(endRef.current);
      document.documentElement.classList.remove(
        ROOT_CLASS,
        FADE_CLASS,
        PREVIEW_CLASS
      );
      clearGlitchTimingVars();
    };
  }, [triggerTakeover]);

  if (!GLITCH_TAKEOVER_ENABLED || !active) return null;

  return (
    <div
      className={`glitch-takeover-overlay${fading ? " glitch-takeover-overlay--fading" : ""}${isPreview ? " glitch-takeover-overlay--preview" : ""}`}
      aria-hidden
    >
      <div className="glitch-matrix-scan" />
      <div className="glitch-matrix-noise" />

      <div className="glitch-matrix-rain">
        {rainCols.map((seed, i) => (
          <div
            key={`${seed}-${i}`}
            className="glitch-matrix-rain-col"
            style={
              {
                "--col-i": i,
                "--col-x": `${4 + i * (isPreview ? 18 : 6.8)}%`,
              } as CSSProperties
            }
          >
            {randomMatrixColumn(seed)}
          </div>
        ))}
      </div>

      {!isPreview && (
        <div className="glitch-terminal-bar">
          <span className="glitch-terminal-line">SYS::RENDER_PIPELINE_FAULT</span>
          <span className="glitch-terminal-line glitch-terminal-line--dim">
            LOWDIF_CHAIN // SECTOR_BREACH // RECOVERING
          </span>
        </div>
      )}
    </div>
  );
}
