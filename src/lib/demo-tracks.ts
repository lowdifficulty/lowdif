/** Demo catalog — 20s playback cap per track (audio files may be longer). */
export const DEMO_TRACK_DURATION_SEC = 20;

export interface DemoTrackSeed {
  title: string;
  genre: string;
  artistName: string;
  coverUrl: string;
  /** SoundHelix demo MP3 index (1–16). */
  soundHelixIndex: number;
}

export const DEMO_TRACKS: DemoTrackSeed[] = [
  { title: "Midnight Frequency", genre: "Electronic", artistName: "Kira Voss", coverUrl: "/covers/midnight-frequency.jpg", soundHelixIndex: 1 },
  { title: "Neon Drift", genre: "Lo-Fi", artistName: "DJ Pulsar", coverUrl: "/covers/neon-drift.jpg", soundHelixIndex: 2 },
  { title: "Voltage Dreams", genre: "Ambient", artistName: "Marek Sol", coverUrl: "/covers/voltage-dreams.jpg", soundHelixIndex: 3 },
  { title: "Chrome Horizon", genre: "Electronic", artistName: "NIGHTSHIFT", coverUrl: "/covers/chrome-horizon.jpg", soundHelixIndex: 4 },
  { title: "Bass Cathedral", genre: "Hip-Hop", artistName: "Rico Tanaka", coverUrl: "/covers/bass-cathedral.jpg", soundHelixIndex: 5 },
  { title: "Static Bloom", genre: "Ambient", artistName: "Lena Kepler", coverUrl: "/covers/static-bloom.jpg", soundHelixIndex: 6 },
  { title: "Pulse Runner", genre: "Electronic", artistName: "DJ Cassian", coverUrl: "/covers/pulse-runner.jpg", soundHelixIndex: 7 },
  { title: "Ghost Signal", genre: "Lo-Fi", artistName: "yung waveform", coverUrl: "/covers/ghost-signal.jpg", soundHelixIndex: 8 },
  { title: "Dark Matter Waltz", genre: "Jazz", artistName: "Thelonious Grey", coverUrl: "/covers/dark-matter-waltz.jpg", soundHelixIndex: 9 },
  { title: "Crystal Protocol", genre: "Electronic", artistName: "ARIA-7", coverUrl: "/covers/crystal-protocol.jpg", soundHelixIndex: 10 },
  { title: "River Code", genre: "Ambient", artistName: "Devon Hale", coverUrl: "/covers/river-code.jpg", soundHelixIndex: 11 },
  { title: "Turbo Saints", genre: "Rock", artistName: "Saint Electric", coverUrl: "/covers/turbo-saints.jpg", soundHelixIndex: 12 },
  { title: "Echo Chamber", genre: "Pop", artistName: "MIMI ROSS", coverUrl: "/covers/echo-chamber.jpg", soundHelixIndex: 13 },
  { title: "Lunar Cache", genre: "Lo-Fi", artistName: "DJ Nocturne", coverUrl: "/covers/lunar-cache.jpg", soundHelixIndex: 14 },
  { title: "Iron Paradise", genre: "Electronic", artistName: "VEXOR", coverUrl: "/covers/iron-paradise.jpg", soundHelixIndex: 15 },
  { title: "Soft Voltage", genre: "Ambient", artistName: "Elara Vance", coverUrl: "/covers/soft-voltage.jpg", soundHelixIndex: 16 },
  { title: "Gridlock Poetry", genre: "Hip-Hop", artistName: "Token B", coverUrl: "/covers/gridlock-poetry.jpg", soundHelixIndex: 1 },
  { title: "Satellite Hearts", genre: "Pop", artistName: "Nova June", coverUrl: "/covers/satellite-hearts.jpg", soundHelixIndex: 2 },
  { title: "Zero Day Blues", genre: "Jazz", artistName: "Miles Cipher", coverUrl: "/covers/zero-day-blues.jpg", soundHelixIndex: 3 },
  { title: "Phantom Arcade", genre: "Electronic", artistName: "8BIT GLITCH", coverUrl: "/covers/phantom-arcade.jpg", soundHelixIndex: 4 },
  { title: "Velvet Circuit", genre: "House", artistName: "DJ Sloane", coverUrl: "/covers/velvet-circuit.jpg", soundHelixIndex: 5 },
];

export function soundHelixUrl(index: number): string {
  return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index}.mp3`;
}

export function artistEmailFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `artist-${slug}@lowdif.com`;
}
