"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrackWithArtist } from "@/lib/types";

export type MiningPhase =
  | "inactive"
  | "active"
  | "completing"
  | "minting"
  | "minted"
  | "failed";

export interface MineResult {
  tokens: number;
  txHash: string;
  tokenSymbol: string;
  message?: string;
  mined: boolean;
}

interface PlayerContextValue {
  currentTrack: TrackWithArtist | null;
  isPlaying: boolean;
  isExpanded: boolean;
  progress: number;
  currentTimeSec: number;
  miningPhase: MiningPhase;
  mineResult: MineResult | null;
  playTrack: (track: TrackWithArtist) => void;
  togglePlay: () => void;
  minimize: () => void;
  expand: () => void;
  seek: (ratio: number) => void;
  closePlayer: () => void;
  clearMineResult: () => void;
}

const AD_MIN_MS = 3500;

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenStartRef = useRef<number>(0);
  const proofSentRef = useRef(false);

  const [currentTrack, setCurrentTrack] = useState<TrackWithArtist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [miningPhase, setMiningPhase] = useState<MiningPhase>("inactive");
  const [mineResult, setMineResult] = useState<MineResult | null>(null);

  const submitProof = useCallback(
    async (track: TrackWithArtist, durationMs: number): Promise<MineResult> => {
      try {
        const res = await fetch("/api/proof-of-listen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: track.id, durationMs }),
        });
        const data = await res.json();

        if (data.mined) {
          const result: MineResult = {
            mined: true,
            tokens: data.tokens,
            txHash: data.txHash,
            tokenSymbol: data.tokenSymbol ?? "LOWDIF",
          };
          setMineResult(result);
          return result;
        }

        const result: MineResult = {
          mined: false,
          tokens: 0,
          txHash: "",
          tokenSymbol: "LOWDIF",
          message:
            data.message ??
            data.error ??
            "Complete the track to mint LOWDIF.",
        };
        setMineResult(result);
        return result;
      } catch {
        const result: MineResult = {
          mined: false,
          tokens: 0,
          txHash: "",
          tokenSymbol: "LOWDIF",
          message: "Mining request failed. Try again.",
        };
        setMineResult(result);
        return result;
      }
    },
    []
  );

  const runCompletionFlow = useCallback(
    async (track: TrackWithArtist) => {
      setMiningPhase("completing");
      const durationMs = Date.now() - listenStartRef.current;

      await new Promise((r) => setTimeout(r, 600));
      setMiningPhase("minting");

      const [, result] = await Promise.all([
        new Promise((r) => setTimeout(r, AD_MIN_MS)),
        submitProof(track, durationMs),
      ]);

      setMiningPhase(result.mined ? "minted" : "failed");
    },
    [submitProof]
  );

  const playTrack = useCallback((track: TrackWithArtist) => {
    proofSentRef.current = false;
    listenStartRef.current = Date.now();
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsExpanded(true);
    setProgress(0);
    setCurrentTimeSec(0);
    setMiningPhase("active");
    setMineResult(null);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const minimize = useCallback(() => setIsExpanded(false), []);
  const expand = useCallback(() => setIsExpanded(true), []);

  const seek = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    audio.currentTime = audio.duration * clamped;
    setProgress(clamped);
    setCurrentTimeSec(audio.currentTime);
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsExpanded(false);
    setProgress(0);
    setCurrentTimeSec(0);
    setMiningPhase("inactive");
    setMineResult(null);
    proofSentRef.current = false;
  }, []);

  const clearMineResult = useCallback(() => setMineResult(null), []);

  useEffect(() => {
    if (!currentTrack) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = currentTrack.fileUrl;
    audio.load();

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTimeSec(audio.currentTime);
      }
    };

    const onEnded = async () => {
      setIsPlaying(false);
      setProgress(1);
      setCurrentTimeSec(audio.duration || currentTrack.durationSec);

      if (!proofSentRef.current) {
        proofSentRef.current = true;
        await runCompletionFlow(currentTrack);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, isPlaying, runCompletionFlow]);

  useEffect(() => {
    if (!isExpanded || !currentTrack) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded, currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isExpanded,
        progress,
        currentTimeSec,
        miningPhase,
        mineResult,
        playTrack,
        togglePlay,
        minimize,
        expand,
        seek,
        closePlayer,
        clearMineResult,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
