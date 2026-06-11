export interface SamplePlaylist {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  trackTitles: string[];
}

export const SAMPLE_PLAYLISTS: SamplePlaylist[] = [
  {
    slug: "midnight-mining",
    title: "Midnight Mining",
    description: "Late-night electronic picks built for proof-of-listen sessions.",
    coverUrl: "/covers/midnight-frequency.jpg",
    trackTitles: [
      "Midnight Frequency",
      "Chrome Horizon",
      "Pulse Runner",
      "Crystal Protocol",
    ],
  },
  {
    slug: "lofi-lounge",
    title: "Lo-Fi Lounge",
    description: "Chill beats for focused listening and steady LOWDIF minting.",
    coverUrl: "/covers/neon-drift.jpg",
    trackTitles: ["Neon Drift", "Ghost Signal", "Lunar Cache", "Satellite Hearts"],
  },
  {
    slug: "jazz-after-dark",
    title: "Jazz After Dark",
    description: "Smoky jazz cuts when the lights go low.",
    coverUrl: "/covers/dark-matter-waltz.jpg",
    trackTitles: ["Dark Matter Waltz", "Zero Day Blues"],
  },
  {
    slug: "hip-hop-heat",
    title: "Hip-Hop Heat",
    description: "Hard-hitting hip-hop for high-energy mining runs.",
    coverUrl: "/covers/bass-cathedral.jpg",
    trackTitles: ["Bass Cathedral", "Gridlock Poetry"],
  },
  {
    slug: "ambient-drift",
    title: "Ambient Drift",
    description: "Atmospheric soundscapes that build color pressure slowly.",
    coverUrl: "/covers/voltage-dreams.jpg",
    trackTitles: [
      "Voltage Dreams",
      "Static Bloom",
      "River Code",
      "Soft Voltage",
    ],
  },
  {
    slug: "pop-icons",
    title: "Pop Icons",
    description: "Hook-forward pop tracks with instant replay value.",
    coverUrl: "/covers/echo-chamber.jpg",
    trackTitles: ["Echo Chamber", "Satellite Hearts", "Turbo Saints"],
  },
  {
    slug: "house-party",
    title: "House Party",
    description: "Club-ready house and electronic for peak mint moments.",
    coverUrl: "/covers/velvet-circuit.jpg",
    trackTitles: [
      "Velvet Circuit",
      "Iron Paradise",
      "Phantom Arcade",
      "Pulse Runner",
    ],
  },
  {
    slug: "rock-voltage",
    title: "Rock & Voltage",
    description: "Guitar-driven energy meets mining intensity.",
    coverUrl: "/covers/turbo-saints.jpg",
    trackTitles: ["Turbo Saints", "Iron Paradise", "Phantom Arcade"],
  },
];

export function playlistBySlug(slug: string): SamplePlaylist | undefined {
  return SAMPLE_PLAYLISTS.find((p) => p.slug === slug);
}
