"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TrackGrid } from "@/components/TrackGrid";
import type { TrackWithArtist } from "@/lib/types";

export default function TrendingPage() {
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
    <div className="space-y-8">
      <SearchBar
        query={query}
        genre={genre}
        onQueryChange={setQuery}
        onGenreChange={setGenre}
      />

      <section>
        <div className="mb-6">
          <p className="ld-eyebrow mb-2">
            {query || genre ? "Results" : "Catalog"}
          </p>
          <h2 className="text-xl font-bold tracking-tight text-ld-text">
            {query || genre ? "Search results" : "Trending now"}
          </h2>
        </div>
        <TrackGrid tracks={tracks} loading={loading} />
      </section>
    </div>
  );
}
