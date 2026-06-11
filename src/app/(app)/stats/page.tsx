"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MyUploadsSection } from "@/components/MyUploadsSection";
import { formatLowdifMinted, lowdifMintedFromPlays } from "@/lib/display";
import type { ArtistStats, StatsSummary } from "@/lib/types";

interface StatsResponse {
  listener: StatsSummary;
  artist: ArtistStats | null;
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(async (r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading stats...
      </div>
    );
  }

  if (!stats) return null;

  const { listener, artist } = stats;

  return (
    <div className="space-y-10">
      <div>
        <p className="ld-eyebrow mb-2">Your activity</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Stats dashboard
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Listen, upload, and mine — all from one account.
        </p>
      </div>

      <div className="grid gap-px bg-ld-border sm:grid-cols-3">
        <StatCard label="Completed listens" value={listener.totalListens} />
        <StatCard
          label="LOWDIF mined"
          value={listener.totalTokensEarned.toFixed(1)}
          accent
        />
        <StatCard label="Unique tracks" value={listener.totalTracksPlayed} />
      </div>

      <MyUploadsSection />

      {artist && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-ld-text">
            Upload analytics
          </h2>
          <div className="grid gap-px bg-ld-border sm:grid-cols-3">
            <StatCard
              label="Total LOWDIF Minted"
              value={lowdifMintedFromPlays(artist.totalPlays)}
            />
            <StatCard label="Tracks uploaded" value={artist.totalTracks} />
            <StatCard
              label="LOWDIF Minted (7 days)"
              value={lowdifMintedFromPlays(artist.recentPlays)}
            />
          </div>

          {artist.topTracks.length > 0 && (
            <div className="ld-card p-6">
              <h3 className="mb-4 font-bold text-ld-text">Top tracks</h3>
              <ul className="space-y-2">
                {artist.topTracks.map((track) => (
                  <li
                    key={track.id}
                    className="flex justify-between text-sm text-ld-text-secondary"
                  >
                    <span>{track.title}</span>
                    <span className="text-ld-text-muted">
                      {formatLowdifMinted(track.playCount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/upload"
            className="inline-block text-xs font-medium uppercase tracking-widest text-ld-text-secondary transition hover:text-ld-text"
          >
            Upload more →
          </Link>
        </section>
      )}

      <section className="ld-card p-6">
        <h2 className="mb-4 text-lg font-bold text-ld-text">
          Recent mining (proof of listen)
        </h2>
        {listener.recentMining.length === 0 ? (
          <p className="text-ld-text-secondary">
            No tokens mined yet. Stream a track to earn LOWDIF.
          </p>
        ) : (
          <ul className="space-y-3">
            {listener.recentMining.map((record) => (
              <li
                key={record.id}
                className="flex flex-col gap-1 border border-ld-border bg-ld-bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ld-text">{record.trackTitle}</p>
                  <p className="text-xs text-ld-text-muted">{record.txHash}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-ld-text">
                    +{record.tokens} LOWDIF
                  </p>
                  <p className="text-ld-text-muted">
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="bg-ld-card p-6">
      <p className="ld-eyebrow">{label}</p>
      <p
        className={`mt-2 text-3xl font-black tracking-tight ${
          accent ? "text-ld-text" : "text-ld-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
