const FALLBACK: [string, string] = ["#ff006e", "#3a86ff"];

function rgb(data: Uint8ClampedArray): string {
  return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
}

/** Deterministic 0–1 values from a string seed (stable per track cover). */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample two colors from an album cover image for the pressure gradient.
 * Falls back to the default palette if the image cannot be read.
 */
export function sampleCoverColors(
  imageUrl: string,
  seed = imageUrl
): Promise<[string, string]> {
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
        const rng = seededRandom(seed);
        const x1 = Math.floor(rng() * size);
        const y1 = Math.floor(rng() * size);
        const x2 = Math.floor(rng() * size);
        const y2 = Math.floor(rng() * size);

        const c1 = ctx.getImageData(x1, y1, 1, 1).data;
        const c2 = ctx.getImageData(x2, y2, 1, 1).data;
        resolve([rgb(c1), rgb(c2)]);
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
