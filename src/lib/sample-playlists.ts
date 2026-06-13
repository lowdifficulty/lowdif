export interface SamplePlaylist {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  trackTitles: string[];
}

export const SAMPLE_PLAYLISTS: SamplePlaylist[] = [
  {
    slug: "trip-hop",
    title: "Trip Hop",
    description:
      "Moody, downtempo cuts — slow grooves built for deep listening and mining.",
    coverUrl: "/covers/trip-hop.svg",
    trackTitles: ["On My Mind", "Yea"],
  },
];

export function playlistBySlug(slug: string): SamplePlaylist | undefined {
  return SAMPLE_PLAYLISTS.find((p) => p.slug === slug);
}
