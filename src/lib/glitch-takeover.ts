/** Full glitch-takeover effect timing. */
export const GLITCH_TAKEOVER_MIN_MS = 45 * 1000;
export const GLITCH_TAKEOVER_MAX_MS = 2 * 60 * 1000;
/** @deprecated Use GLITCH_TAKEOVER_MAX_MS */
export const GLITCH_CYCLE_MS = GLITCH_TAKEOVER_MAX_MS;
/** @deprecated Use GLITCH_TAKEOVER_MAX_MS */
export const GLITCH_TAKEOVER_INTERVAL_MS = GLITCH_TAKEOVER_MAX_MS;
export const GLITCH_TAKEOVER_PEAK_MS = 1_000;
export const GLITCH_TAKEOVER_FADE_MS = 1_000;
export const GLITCH_TAKEOVER_DURATION_MS =
  GLITCH_TAKEOVER_PEAK_MS + GLITCH_TAKEOVER_FADE_MS;

/** Macro cycle — random preview/major scheduling resets every 2 minutes. */
export const GLITCH_MACRO_CYCLE_MS = 2 * 60 * 1000;

/** Small preview glitches fire at random intervals within each macro cycle. */
export const GLITCH_PREVIEW_MIN_MS = 10 * 1000;
export const GLITCH_PREVIEW_MAX_MS = 30 * 1000;

/** @deprecated Use GLITCH_PREVIEW_MIN_MS / GLITCH_PREVIEW_MAX_MS */
export const GLITCH_CYCLE_TICK_MS = GLITCH_PREVIEW_MAX_MS;

export function randomTakeoverDelayMs(): number {
  const span = GLITCH_TAKEOVER_MAX_MS - GLITCH_TAKEOVER_MIN_MS;
  return GLITCH_TAKEOVER_MIN_MS + Math.floor(Math.random() * (span + 1));
}

export function randomPreviewDelayMs(): number {
  const span = GLITCH_PREVIEW_MAX_MS - GLITCH_PREVIEW_MIN_MS;
  return GLITCH_PREVIEW_MIN_MS + Math.floor(Math.random() * (span + 1));
}
export const GLITCH_PREVIEW_DURATION_MS = 450;
export const GLITCH_PREVIEW_PEAK_MS = 350;
export const GLITCH_PREVIEW_FADE_MS = 100;

/** Short burst when entering a page via an internal link (2× faster than before). */
export const GLITCH_NAV_DURATION_MS = 160;
export const GLITCH_NAV_PEAK_MS = 120;
export const GLITCH_NAV_FADE_MS = 40;

/** Skip periodic preview glitches after a nav glitch — they look too similar. */
export const GLITCH_PREVIEW_COOLDOWN_AFTER_NAV_MS = 2 * 60 * 1000;

export type GlitchMode = "full" | "preview" | "nav";

/** Fire a nav-enter glitch on 1 of every N internal navigations. */
export const GLITCH_NAV_EVERY_N = 3;

/** Auth pages — no enter glitch (too disruptive during sign-in flow). */
export const GLITCH_NAV_EXEMPT_PATHS = [
  "/login",
  "/signup",
  "/artist/signup",
] as const;

export function isNavGlitchExemptPath(pathname: string): boolean {
  return (GLITCH_NAV_EXEMPT_PATHS as readonly string[]).includes(pathname);
}

/** Set NEXT_PUBLIC_GLITCH_ENABLED=false to disable all glitch effects. */
export const GLITCH_TAKEOVER_ENABLED =
  process.env.NEXT_PUBLIC_GLITCH_ENABLED !== "false";
