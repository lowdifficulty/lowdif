import { DEMO_TRACKS } from "./demo-tracks";

const COVER_MAP = Object.fromEntries(
  DEMO_TRACKS.map((t) => [t.title, t.coverUrl])
) as Record<string, string>;

export function coverForTitle(title: string): string | null {
  return COVER_MAP[title] ?? null;
}
