import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "covers");
const SIZE = 512;

/** All covers are 512×512 square SVGs. */
const covers = [
  { file: "midnight-frequency.svg", c1: "#1e1b4b", c2: "#7c3aed", accent: "#a78bfa" },
  { file: "neon-drift.svg", c1: "#0f172a", c2: "#ec4899", accent: "#f472b6" },
  { file: "voltage-dreams.svg", c1: "#042f2e", c2: "#14b8a6", accent: "#5eead4" },
  { file: "chrome-horizon.svg", c1: "#0ea5e9", c2: "#6366f1", accent: "#93c5fd" },
  { file: "bass-cathedral.svg", c1: "#f97316", c2: "#dc2626", accent: "#fdba74" },
  { file: "static-bloom.svg", c1: "#a78bfa", c2: "#2dd4bf", accent: "#c4b5fd" },
  { file: "pulse-runner.svg", c1: "#22d3ee", c2: "#3b82f6", accent: "#67e8f9" },
  { file: "ghost-signal.svg", c1: "#94a3b8", c2: "#475569", accent: "#cbd5e1" },
  { file: "dark-matter-waltz.svg", c1: "#fcd34d", c2: "#78350f", accent: "#fde68a" },
  { file: "crystal-protocol.svg", c1: "#e879f9", c2: "#7c3aed", accent: "#f0abfc" },
  { file: "river-code.svg", c1: "#34d399", c2: "#065f46", accent: "#6ee7b7" },
  { file: "turbo-saints.svg", c1: "#fb7185", c2: "#881337", accent: "#fda4af" },
  { file: "echo-chamber.svg", c1: "#f472b6", c2: "#db2777", accent: "#fbcfe8" },
  { file: "lunar-cache.svg", c1: "#818cf8", c2: "#312e81", accent: "#a5b4fc" },
  { file: "iron-paradise.svg", c1: "#71717a", c2: "#18181b", accent: "#a1a1aa" },
  { file: "soft-voltage.svg", c1: "#67e8f9", c2: "#0891b2", accent: "#a5f3fc" },
  { file: "gridlock-poetry.svg", c1: "#fbbf24", c2: "#b45309", accent: "#fcd34d" },
  { file: "satellite-hearts.svg", c1: "#fda4af", c2: "#be123c", accent: "#fecdd3" },
  { file: "zero-day-blues.svg", c1: "#60a5fa", c2: "#1e3a8a", accent: "#93c5fd" },
  { file: "phantom-arcade.svg", c1: "#c084fc", c2: "#6b21a8", accent: "#d8b4fe" },
  { file: "velvet-circuit.svg", c1: "#f43f5e", c2: "#4c0519", accent: "#fb7185" },
];

function coverSvg({ c1, c2, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)"/>
  <circle cx="${SIZE * 0.72}" cy="${SIZE * 0.28}" r="${SIZE * 0.18}" fill="${accent}" opacity="0.12"/>
  <rect x="${SIZE * 0.08}" y="${SIZE * 0.62}" width="${SIZE * 0.35}" height="${SIZE * 0.06}" fill="${accent}" opacity="0.2"/>
</svg>`;
}

mkdirSync(outDir, { recursive: true });

for (const cover of covers) {
  writeFileSync(join(outDir, cover.file), coverSvg(cover));
}

console.log(`Generated ${covers.length} square cover SVGs (${SIZE}×${SIZE}).`);
