export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Total LOWDIF minted per completed stream (artist + listener share). */
export function lowdifMintedFromPlays(playCount: number): number {
  return playCount * 2;
}

export function formatLowdifMinted(playCount: number): string {
  return `${lowdifMintedFromPlays(playCount)} LOWDIF Minted`;
}
