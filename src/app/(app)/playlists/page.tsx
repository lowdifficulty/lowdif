"use client";

import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { playlistShareTarget } from "@/lib/share";
import { SAMPLE_PLAYLISTS } from "@/lib/sample-playlists";

export default function PlaylistsPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="ld-eyebrow mb-2">Curated</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Playlists
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Eight sample playlists to mine LOWDIF across the catalog.
        </p>
      </div>

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
    </div>
  );
}
