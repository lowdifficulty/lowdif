export const AD_DURATION_MS = 5000;

export type AdBrand = "maserati" | "li-ning" | "kalshi";

export interface AdTheme {
  background: string;
  overlay: string;
  accent: string;
  accentMuted: string;
  progress: string;
  brandTracking: string;
  taglineTracking: string;
}

export interface AdVariant {
  id: string;
  brand: AdBrand;
  brandLabel: string;
  tagline: string;
  theme: AdTheme;
}

const MASERATI_THEME: AdTheme = {
  background:
    "linear-gradient(145deg, #0a0a0a 0%, #1a1410 45%, #2d1f14 100%)",
  overlay:
    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.7) 100%)",
  accent: "#c9a96e",
  accentMuted: "rgba(201,169,110,0.55)",
  progress: "#ffffff",
  brandTracking: "0.45em",
  taglineTracking: "0.2em",
};

const LI_NING_THEME: AdTheme = {
  background:
    "linear-gradient(160deg, #0d0d0d 0%, #8b0000 42%, #c8102e 100%)",
  overlay:
    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(139,0,0,0.15) 55%, rgba(0,0,0,0.65) 100%)",
  accent: "#ffffff",
  accentMuted: "rgba(255,255,255,0.5)",
  progress: "#ffffff",
  brandTracking: "0.35em",
  taglineTracking: "0.18em",
};

const KALSHI_THEME: AdTheme = {
  background:
    "linear-gradient(155deg, #04120f 0%, #0a3d32 50%, #12c48b 100%)",
  overlay:
    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(10,61,50,0.2) 50%, rgba(0,0,0,0.55) 100%)",
  accent: "#12c48b",
  accentMuted: "rgba(18,196,139,0.55)",
  progress: "#12c48b",
  brandTracking: "0.3em",
  taglineTracking: "0.14em",
};

export const AD_VARIANTS: AdVariant[] = [
  {
    id: "maserati-excellence",
    brand: "maserati",
    brandLabel: "Maserati",
    tagline: "The audacity of excellence",
    theme: MASERATI_THEME,
  },
  {
    id: "maserati-extraordinary",
    brand: "maserati",
    brandLabel: "Maserati",
    tagline: "Drive the extraordinary",
    theme: MASERATI_THEME,
  },
  {
    id: "maserati-beyond",
    brand: "maserati",
    brandLabel: "Maserati",
    tagline: "Beyond driven",
    theme: MASERATI_THEME,
  },
  {
    id: "li-ning-possible",
    brand: "li-ning",
    brandLabel: "Li-Ning",
    tagline: "Anything is possible",
    theme: LI_NING_THEME,
  },
  {
    id: "li-ning-change",
    brand: "li-ning",
    brandLabel: "Li-Ning",
    tagline: "Make the change",
    theme: LI_NING_THEME,
  },
  {
    id: "li-ning-lane",
    brand: "li-ning",
    brandLabel: "Li-Ning",
    tagline: "Enter the lane",
    theme: LI_NING_THEME,
  },
  {
    id: "kalshi-trade",
    brand: "kalshi",
    brandLabel: "Kalshi",
    tagline: "Trade on what you know",
    theme: KALSHI_THEME,
  },
  {
    id: "kalshi-markets",
    brand: "kalshi",
    brandLabel: "Kalshi",
    tagline: "Real markets. Real time.",
    theme: KALSHI_THEME,
  },
  {
    id: "kalshi-yesno",
    brand: "kalshi",
    brandLabel: "Kalshi",
    tagline: "Yes or no. Get paid.",
    theme: KALSHI_THEME,
  },
];

export function pickAdVariant(seed?: number): AdVariant {
  if (seed !== undefined) {
    const index = Math.abs(seed) % AD_VARIANTS.length;
    return AD_VARIANTS[index]!;
  }
  return AD_VARIANTS[Math.floor(Math.random() * AD_VARIANTS.length)]!;
}
