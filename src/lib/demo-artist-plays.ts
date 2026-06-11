/**
 * Completed stream count per catalog artist (playCount on their track).
 * Displayed as playCount × 2 LOWDIF Minted in the UI.
 */
export const DEMO_ARTIST_PLAY_COUNTS: Record<string, number> = {
  "Kira Voss": 142,
  "DJ Pulsar": 120,
  "NIGHTSHIFT": 99,
  "ARIA-7": 88,
  "DJ Sloane": 76,
  "VEXOR": 67,
  "Marek Sol": 59,
  "8BIT GLITCH": 48,
  "Rico Tanaka": 43,
  "MIMI ROSS": 36,
  "Saint Electric": 29,
  "yung waveform": 20,
  "DJ Cassian": 34,
  "Lena Kepler": 28,
  "Thelonious Grey": 24,
  "Devon Hale": 22,
  "DJ Nocturne": 19,
  "Elara Vance": 16,
  "Token B": 14,
  "Nova June": 12,
  "Miles Cipher": 9,
};

export function playCountForArtist(artistName: string): number {
  return DEMO_ARTIST_PLAY_COUNTS[artistName] ?? 8;
}
