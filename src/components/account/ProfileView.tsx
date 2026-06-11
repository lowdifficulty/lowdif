"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/display";
import type { PublicUserProfile } from "@/lib/public-profile";

interface ProfileViewProps {
  userId: string;
  isOwner?: boolean;
}

function formatWallet(wallet: string | null): string {
  if (!wallet) return "Not set";
  if (wallet.length <= 14) return wallet;
  return `${wallet.slice(0, 8)}…${wallet.slice(-6)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export function ProfileView({ userId, isOwner = false }: ProfileViewProps) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}/public`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Profile not found.");
        const data = await r.json();
        return data.profile as PublicUserProfile;
      })
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load profile.")
      )
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        {error ?? "Profile not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div
          className="mx-auto h-28 w-28 shrink-0 bg-ld-bg-secondary bg-cover bg-center sm:mx-0"
          style={
            profile.avatarUrl
              ? { backgroundImage: `url(${profile.avatarUrl})` }
              : undefined
          }
        >
          {!profile.avatarUrl && (
            <div className="flex h-full w-full items-center justify-center text-4xl font-black text-ld-text-muted">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="ld-eyebrow mb-2">
            {isOwner ? "Public profile" : "Profile"}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-ld-text">
            {profile.name}
          </h1>
          <p className="mt-2 text-sm text-ld-text-secondary">
            Member since {formatDate(profile.memberSince)}
          </p>
          {profile.bio ? (
            <p className="mt-4 text-sm leading-relaxed text-ld-text-secondary">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-ld-text-muted">
              No bio yet.
            </p>
          )}
          {isOwner && (
            <p className="mt-4 text-xs text-ld-text-muted">
              This is how other listeners see you on LOWDIF.{" "}
              <Link
                href={`/users/${profile.id}`}
                className="text-ld-text underline"
              >
                Open public link
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Listens", value: profile.stats.totalListens },
          {
            label: "LOWDIF mined",
            value: profile.stats.totalTokensEarned.toFixed(1),
          },
          { label: "Uploads", value: profile.stats.totalUploads },
          {
            label: "Plays on uploads",
            value: profile.stats.totalPlaysOnUploads,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-ld-border bg-ld-bg-secondary px-4 py-5"
          >
            <p className="text-2xl font-black text-ld-text">{stat.value}</p>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-ld-text-muted uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ld-card p-6">
          <p className="ld-eyebrow mb-4">Wallet</p>
          <p className="break-all font-mono text-sm text-ld-text">
            {profile.walletAddress ?? "Not set"}
          </p>
          {profile.walletAddress && (
            <p className="mt-2 text-xs text-ld-text-muted">
              Short: {formatWallet(profile.walletAddress)}
            </p>
          )}
        </section>

        <section className="ld-card p-6">
          <p className="ld-eyebrow mb-4">Mining preference</p>
          <p className="text-sm font-bold text-ld-text">
            {profile.giveShareToArtists
              ? "Shares mining rewards with artists"
              : "Keeps listener mining rewards"}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ld-text-secondary">
            {profile.giveShareToArtists
              ? "LOWDIF minted while listening is sent to track artists instead of this wallet."
              : "LOWDIF minted while listening is sent to this listener wallet."}
          </p>
        </section>
      </div>

      <section>
        <div className="mb-6">
          <p className="ld-eyebrow mb-2">Catalog</p>
          <h2 className="text-xl font-bold tracking-tight text-ld-text">
            Uploads
          </h2>
        </div>

        {profile.tracks.length === 0 ? (
          <div className="border border-ld-border bg-ld-bg-secondary px-6 py-12 text-center text-sm text-ld-text-secondary">
            No uploads yet.
            {isOwner && (
              <>
                {" "}
                <Link href="/upload" className="text-ld-text underline">
                  Upload a track
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {profile.tracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center gap-4 border border-ld-border bg-ld-card p-4 transition hover:border-ld-border-strong"
              >
                <div
                  className="h-14 w-14 shrink-0 bg-cover bg-center"
                  style={
                    track.coverUrl
                      ? { backgroundImage: `url(${track.coverUrl})` }
                      : undefined
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ld-text">{track.title}</p>
                  <p className="mt-1 text-xs text-ld-text-secondary">
                    {track.genre}
                    {track.durationSec > 0 &&
                      ` · ${formatDuration(track.durationSec)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ld-text">
                    {track.playCount} plays
                  </p>
                  <p className="mt-1 text-[10px] tracking-widest text-ld-text-muted uppercase">
                    {track.lowdifMinted} LOWDIF
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
