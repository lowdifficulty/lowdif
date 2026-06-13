const FALLBACK: [string, string] = ["#ff006e", "#3a86ff"];

type Rgb = [number, number, number];

function rgb([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Prefer lighter pixels and those with more chroma (colorful vs gray/black). */
function scoreColor(r: number, g: number, b: number): number {
  const lum = luminance(r, g, b);
  if (lum < 45) return 0;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const saturation = max === 0 ? 0 : chroma / max;

  return lum * 0.55 + chroma * 1.1 + saturation * 80;
}

function colorDistance(a: Rgb, b: Rgb): number {
  const [r1, g1, b1] = a;
  const [r2, g2, b2] = b;
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

function pickVividPair(data: Uint8ClampedArray): [Rgb, Rgb] | null {
  const candidates: { rgb: Rgb; score: number }[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const score = scoreColor(r, g, b);
    if (score > 0) candidates.push({ rgb: [r, g, b], score });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (best.score < 35) return null;

  const pool = candidates.slice(0, Math.max(8, Math.floor(candidates.length * 0.12)));
  let second = pool.find(
    (c) => c !== best && colorDistance(best.rgb, c.rgb) >= 55
  );

  if (!second) {
    second = pool.reduce<(typeof candidates)[number] | null>((furthest, c) => {
      if (c === best) return furthest;
      if (!furthest) return c;
      return colorDistance(best.rgb, c.rgb) > colorDistance(best.rgb, furthest.rgb)
        ? c
        : furthest;
    }, null);
  }

  if (!second) second = candidates[Math.min(1, candidates.length - 1)];
  return [best.rgb, second.rgb];
}

/**
 * Sample two colors from an album cover image for the pressure gradient.
 * Falls back to the default palette if the image cannot be read.
 */
export function sampleCoverColors(imageUrl: string): Promise<[string, string]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 80;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(FALLBACK);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const pair = pickVividPair(data);
        resolve(pair ? [rgb(pair[0]), rgb(pair[1])] : FALLBACK);
      } catch {
        resolve(FALLBACK);
      }
    };

    img.onerror = () => resolve(FALLBACK);
    img.src = imageUrl;
  });
}

/** Two-color diagonal gradient — same 135° angle as the original pressure design. */
export function colorsToGradient([a, b]: [string, string]): string {
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

export const DEFAULT_PRESSURE_GRADIENT = colorsToGradient(FALLBACK);
