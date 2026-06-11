"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SharedByBanner } from "@/components/SharedByBanner";
import { ShareButton } from "@/components/ShareButton";
import { usePlayer } from "@/components/PlayerProvider";
import { storeReferral } from "@/lib/share-referral";
import { trackShareTarget } from "@/lib/share";
import type { TrackWithArtist } from "@/lib/types";

interface ShareLandingProps {
  trackId: string;
}

export function ShareLanding({ trackId }: ShareLandingProps) {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [track, setTrack] = useState<TrackWithArtist | null>(null);
  const [sharerName, setSharerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tracks/${trackId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Track not found.");
          return;
        }
        setTrack(data.track);
      } catch {
        setError("Unable to load track.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [trackId]);

  useEffect(() => {
    if (!ref) return;
    void fetch(`/api/users/${ref}/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const name = data?.user?.name ?? null;
        setSharerName(name);
        storeReferral(ref, name);
      })
      .catch(() => storeReferral(ref));
  }, [ref]);

  useEffect(() => {
    if (!track || started) return;
    playTrack(track);
    setStarted(true);
  }, [track, started, playTrack]);

  if (loading) {
    return (
      <div className="py-20 text-center text-ld-text-secondary">
        Loading track…
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="py-20 text-center">
        <p className="text-ld-text-secondary">{error ?? "Track not found."}</p>
        <Link
          href="/trending"
          className="mt-4 inline-block text-xs font-medium uppercase tracking-widest text-ld-text-secondary hover:text-ld-text"
        >
          ← Browse catalog
        </Link>
      </div>
    );
  }

  const isThisTrack = currentTrack?.id === track.id;

  return (
    <div className="space-y-6">
      {sharerName && <SharedByBanner sharerName={sharerName} />}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div
          className="mx-auto h-48 w-48 shrink-0 bg-ld-bg-secondary bg-cover bg-center sm:mx-0 sm:h-56 sm:w-56"
          style={
            track.coverUrl
              ? { backgroundImage: `url(${track.coverUrl})` }
              : undefined
          }
        />
        <div className="flex-1 text-center sm:text-left">
          <p className="ld-eyebrow mb-2">Now playing</p>
          <h1 className="text-3xl font-black tracking-tight text-ld-text">
            {track.title}
          </h1>
          <p className="mt-2 text-lg text-ld-text-secondary">
            {track.artist.name}
          </p>
          <p className="mt-1 text-sm text-ld-text-muted">{track.genre}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => playTrack(track)}
              className="border-2 border-white bg-white px-6 py-3 text-[11px] font-bold tracking-widest text-black uppercase transition hover:bg-transparent hover:text-white"
            >
              {isThisTrack && isPlaying ? "Playing" : "Play"}
            </button>
            <ShareButton target={trackShareTarget(track)} label="Share track" />
            <Link
              href="/signup"
              className="border border-ld-border-strong px-6 py-3 text-[11px] font-bold tracking-widest text-ld-text uppercase transition hover:border-white"
            >
              Join & mine
            </Link>
          </div>
        </div>
      </div>

      <p className="border border-ld-border bg-ld-bg-secondary px-4 py-3 text-xs text-ld-text-secondary">
        Listen to 80% of the track to mint LOWDIF via proof-of-listen. The first
        cryptocurrency mined by listening.
      </p>
    </div>
  );
}
