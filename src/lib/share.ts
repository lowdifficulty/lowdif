import type { TrackWithArtist } from "./types";
import { buildTrackSharePath } from "./share-slug";
import { appOrigin, marketingOrigin } from "./site-urls";

export type ShareTargetType = "track" | "playlist";

export type ShareChannel =
  | "copy"
  | "embed"
  | "tiktok"
  | "facebook"
  | "instagram"
  | "email"
  | "sms"
  | "native";

export interface PlaylistShareInfo {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
}

export interface ShareTarget {
  type: ShareTargetType;
  track?: TrackWithArtist;
  playlist?: PlaylistShareInfo;
}

export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Public marketing origin used in share links (e.g. lowdif.com). */
export function getShareOrigin(): string {
  if (marketingOrigin) return marketingOrigin.origin;
  if (appOrigin) return appOrigin.origin;
  if (typeof window !== "undefined") return window.location.origin;
  return (
    process.env.NEXT_PUBLIC_MARKETING_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export function buildShareUrl(
  target: ShareTarget,
  ref?: string | null,
  origin = getShareOrigin()
): string {
  const params = new URLSearchParams();
  if (ref) params.set("ref", ref);
  const qs = params.toString();
  const suffix = qs ? `?${qs}` : "";
  const base = origin.replace(/\/$/, "");

  if (target.type === "track" && target.track) {
    return `${base}${buildTrackSharePath(target.track)}${suffix}`;
  }
  if (target.type === "playlist" && target.playlist) {
    return `${base}/playlists/${target.playlist.slug}${suffix}`;
  }
  return base;
}

export function buildEmbedUrl(trackId: string, origin = getAppOrigin()): string {
  return `${origin}/embed/t/${trackId}`;
}

export function buildEmbedCode(trackId: string, origin = getAppOrigin()): string {
  const src = buildEmbedUrl(trackId, origin);
  return `<iframe src="${src}" width="352" height="152" style="border:0;" allow="autoplay" title="LOWDIF player"></iframe>`;
}

export function buildShareMessage(
  target: ShareTarget,
  sharerName?: string | null
): string {
  const intro = sharerName
    ? `${sharerName} shared this on LOWDIF`
    : "Listen on LOWDIF";

  if (target.type === "track" && target.track) {
    return `${intro}: "${target.track.title}" by ${target.track.artist.name}. Stream music and mine LOWDIF tokens just by listening.`;
  }
  if (target.type === "playlist" && target.playlist) {
    return `${intro}: playlist "${target.playlist.title}" (${target.playlist.trackCount} tracks). Mine crypto by listening.`;
  }
  return `${intro} — the first cryptocurrency mined by listening.`;
}

export function buildShareTitle(target: ShareTarget): string {
  if (target.type === "track" && target.track) {
    return `${target.track.title} — ${target.track.artist.name}`;
  }
  if (target.type === "playlist" && target.playlist) {
    return `${target.playlist.title} playlist`;
  }
  return "LOWDIF";
}

export function getShareCoverUrl(target: ShareTarget, origin = getAppOrigin()): string | null {
  if (target.type === "track") return target.track?.coverUrl ?? null;
  if (target.type === "playlist") {
    const cover = target.playlist?.coverUrl;
    if (!cover) return null;
    return cover.startsWith("http") ? cover : `${origin}${cover}`;
  }
  return null;
}

export function socialShareUrls(url: string, text: string) {
  const encodedUrl = encodeURIComponent(url);
  const combined = encodeURIComponent(`${text} ${url}`);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent("Listen on LOWDIF")}&body=${combined}`,
    sms: `sms:?&body=${combined}`,
    tiktok: url,
    instagram: url,
  };
}

export function trackShareTarget(track: TrackWithArtist): ShareTarget {
  return { type: "track", track };
}

export function playlistShareTarget(playlist: PlaylistShareInfo): ShareTarget {
  return { type: "playlist", playlist };
}
