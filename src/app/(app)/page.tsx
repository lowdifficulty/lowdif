"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { TrackGrid } from "@/components/TrackGrid";
import type { TrackWithArtist } from "@/lib/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [tracks, setTracks] = useState<TrackWithArtist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = useCallback(async (q: string, g: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (g) params.set("genre", g);
      const res = await fetch(`/api/tracks?${params}`);
      const data = await res.json();
      setTracks(data.tracks ?? []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchTracks(query, genre);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, genre, fetchTracks]);

  return (
    <div className="space-y-12">
      <section className="space-y-6 text-center">
        <p className="ld-eyebrow">Proof of Listen</p>
        <h1 className="text-4xl font-black tracking-tighter text-ld-text sm:text-6xl sm:leading-none">
          Music is the
          <br />
          Mining Rig
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-ld-text-secondary">
          Press play, complete a full listen, and earn 1 LOWDIF — split equally
          between you and the artist. No hardware. Just music.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-0 pt-4">
          <div className="px-8 text-center sm:px-12">
            <p className="text-2xl font-black tracking-tight text-ld-text sm:text-3xl">
              0
            </p>
            <p className="ld-eyebrow mt-2">Pre-mine</p>
          </div>
          <div className="h-10 w-px bg-ld-border" />
          <div className="px-8 text-center sm:px-12">
            <p className="text-2xl font-black tracking-tight text-ld-text sm:text-3xl">
              1
            </p>
            <p className="ld-eyebrow mt-2">Token per listen</p>
          </div>
          <div className="h-10 w-px bg-ld-border" />
          <div className="px-8 text-center sm:px-12">
            <p className="text-2xl font-black tracking-tight text-ld-text sm:text-3xl">
              50/50
            </p>
            <p className="ld-eyebrow mt-2">Listener / Artist</p>
          </div>
        </div>
      </section>

      <SearchBar
        query={query}
        genre={genre}
        onQueryChange={setQuery}
        onGenreChange={setGenre}
      />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="ld-eyebrow mb-2">
              {query || genre ? "Results" : "Catalog"}
            </p>
            <h2 className="text-xl font-bold tracking-tight text-ld-text">
              {query || genre ? "Search results" : "Trending now"}
            </h2>
          </div>
          <Link
            href="/artist/signup"
            className="text-xs font-medium uppercase tracking-widest text-ld-text-secondary transition hover:text-ld-text"
          >
            Artist signup →
          </Link>
        </div>
        <TrackGrid tracks={tracks} loading={loading} />
      </section>
    </div>
  );
}
