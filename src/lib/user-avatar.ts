import { DEMO_LISTENERS } from "./demo-listeners";
import { DEMO_TRACKS } from "./demo-tracks";

const LISTENER_AVATARS = new Map(
  DEMO_LISTENERS.map((l) => [l.name.toLowerCase(), l.avatarUrl])
);

const CATALOG_COVERS = new Map(
  DEMO_TRACKS.map((t) => [t.artistName.toLowerCase(), t.coverUrl])
);

export function avatarForUser(
  name: string,
  trackCover?: string | null
): string {
  if (trackCover) return trackCover;
  return (
    CATALOG_COVERS.get(name.toLowerCase()) ??
    LISTENER_AVATARS.get(name.toLowerCase()) ??
    "/covers/lunar-cache.jpg"
  );
}

/** Prefer uploaded profile photo; optional track cover only as last resort. */
export function resolveUserAvatar(
  name: string,
  profileAvatar?: string | null,
  trackCoverFallback?: string | null
): string {
  if (profileAvatar) return profileAvatar;
  return avatarForUser(name, trackCoverFallback);
}
