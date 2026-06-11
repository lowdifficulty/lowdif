"use client";

import { useEffect, useState } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [listeners, setListeners] = useState<LeaderboardEntry[]>([]);
  const [artists, setArtists] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error ?? "Failed to load leaderboard");
        }
        return data;
      })
      .then((data) => {
        setListeners(data.listeners ?? []);
        setArtists(data.artists ?? []);
        setError(null);
      })
      .catch((err: Error) => {
        setListeners([]);
        setArtists([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading leaderboard…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="ld-eyebrow mb-2">Rankings</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Leaderboard
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Top miners by LOWDIF earned and top publishers by minted plays.
        </p>
      </div>

      {error && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}. Try restarting the dev server after running{" "}
          <code className="text-red-200">npx prisma generate</code>.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <LeaderboardTable
          title="Top miners"
          entries={listeners}
          emptyMessage="No mining yet. Stream a track to climb the board."
        />
        <LeaderboardTable
          title="Top publishers"
          entries={artists}
          emptyMessage="No uploads yet. Publish tracks to rank here."
        />
      </div>
    </div>
  );
}
