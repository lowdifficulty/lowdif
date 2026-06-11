import {
  GLITCH_PREVIEW_COOLDOWN_AFTER_NAV_MS,
  type GlitchMode,
} from "./glitch-takeover";

let trigger: ((mode: GlitchMode) => void) | null = null;
let previewSuppressedUntil = 0;

export function registerGlitchTrigger(fn: (mode: GlitchMode) => void) {
  trigger = fn;
  return () => {
    if (trigger === fn) trigger = null;
  };
}

export function fireGlitch(mode: GlitchMode) {
  trigger?.(mode);
}

export function markNavGlitchShown() {
  previewSuppressedUntil = Date.now() + GLITCH_PREVIEW_COOLDOWN_AFTER_NAV_MS;
}

export function isPreviewGlitchSuppressed(): boolean {
  return Date.now() < previewSuppressedUntil;
}
