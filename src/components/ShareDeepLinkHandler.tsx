"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { storeReferral } from "@/lib/share-referral";
import type { TrackWithArtist } from "@/lib/types";
import { usePlayer } from "./PlayerProvider";

export function ShareDeepLinkHandler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { playTrack } = usePlayer();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    const playId = searchParams.get("play");
    const key = `${pathname}?ref=${ref ?? ""}&play=${playId ?? ""}`;

    if (handledRef.current === key) return;

    async function resolveRef() {
      if (!ref) return;
      try {
        const res = await fetch(`/api/users/${ref}/public`);
        if (res.ok) {
          const data = await res.json();
          storeReferral(ref, data.user?.name ?? null);
        } else {
          storeReferral(ref);
        }
      } catch {
        storeReferral(ref);
      }
    }

    async function autoPlay(trackId: string) {
      try {
        const res = await fetch(`/api/tracks/${trackId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.track) {
          playTrack(data.track as TrackWithArtist);
        }
      } catch {
        /* ignore */
      }
    }

    void (async () => {
      if (ref) await resolveRef();

      if (playId && pathname === "/trending") {
        await autoPlay(playId);
        handledRef.current = key;
        const next = new URLSearchParams(searchParams.toString());
        next.delete("play");
        const qs = next.toString();
        router.replace(qs ? `/trending?${qs}` : "/trending", { scroll: false });
        return;
      }

      handledRef.current = key;
    })();
  }, [searchParams, pathname, router, playTrack]);

  return null;
}
