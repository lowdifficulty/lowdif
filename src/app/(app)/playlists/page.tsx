"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShareButton } from "@/components/ShareButton";
import { playlistShareTarget } from "@/lib/share";
import { MY_PLAYLIST_SLUG } from "@/lib/playlist-constants";
import { SAMPLE_PLAYLISTS } from "@/lib/sample-playlists";
import type { PlaylistSummary } from "@/lib/types";

export default function PlaylistsPage() {
  const [myPlaylist, setMyPlaylist] = useState<PlaylistSummary | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void fetch("/api/playlists/mine", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          setSignedIn(false);
          return null;
        }
        if (!res.ok) return null;
        setSignedIn(true);
        return res.json();
      })
      .then((data) => {
        if (data?.playlist) setMyPlaylist(data.playlist);
      })
      .catch(() => setSignedIn(false));
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <p className="ld-eyebrow mb-2">Library</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Playlists
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Your saved tracks and curated picks from the catalog.
        </p>
      </div>

      <section className="space-y-4">
        <p className="ld-eyebrow">Yours</p>
        <div className="grid gap-px bg-ld-border sm:grid-cols-2 lg:grid-cols-4">
          {signedIn && myPlaylist ? (
            <div className="group relative bg-ld-card p-4 transition hover:bg-ld-card-hover">
              <Link href={`/playlists/${MY_PLAYLIST_SLUG}`} className="block">
                <div
                  className="mb-4 aspect-square bg-ld-bg-secondary bg-cover bg-center"
                  style={{ backgroundImage: `url(${myPlaylist.coverUrl})` }}
                />
                <p className="font-bold text-ld-text transition group-hover:text-white">
                  {myPlaylist.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-ld-text-secondary">
                  {myPlaylist.description}
                </p>
                <p className="mt-2 text-[11px] text-ld-text-muted">
                  {myPlaylist.trackCount} tracks · drag to reorder
                </p>
              </Link>
            </div>
          ) : (
            <div className="bg-ld-card p-4 sm:col-span-2 lg:col-span-1">
              <p className="font-bold text-ld-text">My Playlist</p>
              <p className="mt-2 text-xs text-ld-text-secondary">
                {signedIn
                  ? "Save tracks with the + button in the player."
                  : "Sign in to build your playlist."}
              </p>
              {!signedIn && (
                <Link
                  href="/login"
                  className="ld-btn-outline mt-4 inline-block px-4 py-2 text-[10px]"
                >
                  Sign in
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <p className="ld-eyebrow">Curated</p>
        <div className="grid gap-px bg-ld-border sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_PLAYLISTS.map((playlist) => (
            <div
              key={playlist.slug}
              className="group relative bg-ld-card p-4 transition hover:bg-ld-card-hover"
            >
              <Link href={`/playlists/${playlist.slug}`} className="block">
                <div
                  className="mb-4 aspect-square bg-ld-bg-secondary bg-cover bg-center"
                  style={{ backgroundImage: `url(${playlist.coverUrl})` }}
                />
                <p className="font-bold text-ld-text transition group-hover:text-white">
                  {playlist.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-ld-text-secondary">
                  {playlist.description}
                </p>
                <p className="mt-2 text-[11px] text-ld-text-muted">
                  {playlist.trackTitles.length} tracks
                </p>
              </Link>
              <div className="absolute top-3 right-3 opacity-0 transition group-hover:opacity-100">
                <ShareButton
                  target={playlistShareTarget({
                    slug: playlist.slug,
                    title: playlist.title,
                    description: playlist.description,
                    coverUrl: playlist.coverUrl,
                    trackCount: playlist.trackTitles.length,
                  })}
                  compact
                  className="flex h-8 w-8 items-center justify-center border border-ld-border-strong bg-black/80 text-xs text-white backdrop-blur-sm transition hover:border-white"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
