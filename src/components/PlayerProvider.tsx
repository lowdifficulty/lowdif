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
import { MINT_GAP_MS } from "@/lib/player-timing";
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
  playTrack: (track: TrackWithArtist, queue?: TrackWithArtist[]) => void;
  togglePlay: () => void;
  skipBack: () => void;
  skipForward: () => void;
  minimize: () => void;
  expand: () => void;
  seek: (ratio: number) => void;
  closePlayer: () => void;
  clearMineResult: () => void;
  verifiedOverlayVisible: boolean;
  dismissVerifiedOverlay: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function effectiveDuration(track: TrackWithArtist, audioDuration: number): number {
  if (track.durationSec > 0) return track.durationSec;
  return audioDuration || 0;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenStartRef = useRef<number>(0);
  const proofSentRef = useRef(false);
  const queueRef = useRef<TrackWithArtist[]>([]);
  const currentTrackRef = useRef<TrackWithArtist | null>(null);
  const completionTriggeredRef = useRef(false);
  const completionGenRef = useRef(0);

  const [currentTrack, setCurrentTrack] = useState<TrackWithArtist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [miningPhase, setMiningPhase] = useState<MiningPhase>("inactive");
  const [mineResult, setMineResult] = useState<MineResult | null>(null);
  const [verifiedOverlayVisible, setVerifiedOverlayVisible] = useState(false);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

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

  const resetMiningSession = useCallback(() => {
    proofSentRef.current = false;
    completionTriggeredRef.current = false;
    listenStartRef.current = Date.now();
    setMiningPhase("active");
    setMineResult(null);
    setVerifiedOverlayVisible(false);
  }, []);

  const startTrack = useCallback(
    (track: TrackWithArtist) => {
      completionGenRef.current += 1;
      resetMiningSession();
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsExpanded(true);
      progressRef.current = 0;
      setProgress(0);
      setCurrentTimeSec(0);
    },
    [resetMiningSession]
  );

  const playTrack = useCallback(
    (track: TrackWithArtist, queue?: TrackWithArtist[]) => {
      if (queue) queueRef.current = queue;
      const isReplay =
        currentTrackRef.current?.id === track.id &&
        (miningPhase === "minted" || miningPhase === "failed");

      if (isReplay) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
        }
        resetMiningSession();
        setIsPlaying(true);
        setIsExpanded(true);
        progressRef.current = 0;
        setProgress(0);
        setCurrentTimeSec(0);
        return;
      }

      startTrack(track);
    },
    [startTrack, resetMiningSession, miningPhase]
  );

  const playAdjacent = useCallback(
    (direction: -1 | 1) => {
      const queue = queueRef.current;
      const current = currentTrackRef.current;
      if (!queue.length || !current) return;

      const idx = queue.findIndex((t) => t.id === current.id);
      const nextIdx =
        idx < 0
          ? 0
          : (idx + direction + queue.length) % queue.length;
      const next = queue[nextIdx];
      if (next.id === current.id && queue.length < 2) return;

      startTrack(next);
    },
    [startTrack]
  );

  const skipBack = useCallback(() => playAdjacent(-1), [playAdjacent]);
  const skipForward = useCallback(() => playAdjacent(1), [playAdjacent]);

  const playNextInQueue = useCallback(() => {
    playAdjacent(1);
  }, [playAdjacent]);

  const runCompletionFlow = useCallback(
    async (track: TrackWithArtist) => {
      const gen = ++completionGenRef.current;
      setMiningPhase("minting");
      const durationMs = Date.now() - listenStartRef.current;
      const gapStart = Date.now();

      const result = await submitProof(track, durationMs);

      if (completionGenRef.current !== gen) return;

      if (result.mined) {
        setMiningPhase("minted");
        setVerifiedOverlayVisible(true);
      } else {
        setMiningPhase("failed");
      }

      const remaining = MINT_GAP_MS - (Date.now() - gapStart);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      if (completionGenRef.current !== gen) return;

      setVerifiedOverlayVisible(false);
      playNextInQueue();
    },
    [submitProof, playNextInQueue]
  );

  const triggerCompletion = useCallback(
    async (track: TrackWithArtist) => {
      if (proofSentRef.current || completionTriggeredRef.current) return;
      proofSentRef.current = true;
      completionTriggeredRef.current = true;

      const audio = audioRef.current;
      if (audio) audio.pause();

      setIsPlaying(false);
      progressRef.current = 1;
      setProgress(1);
      setCurrentTimeSec(
        effectiveDuration(track, audio?.duration ?? track.durationSec)
      );

      await runCompletionFlow(track);
    },
    [runCompletionFlow]
  );

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const minimize = useCallback(() => setIsExpanded(false), []);
  const expand = useCallback(() => setIsExpanded(true), []);

  const seek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      const track = currentTrackRef.current;
      if (!audio || !track) return;

      const duration = effectiveDuration(track, audio.duration);
      if (!duration) return;

      const clamped = Math.max(0, Math.min(1, ratio));
      const targetTime = duration * clamped;

      if (
        clamped < 0.03 &&
        (miningPhase === "minted" || miningPhase === "failed")
      ) {
        resetMiningSession();
      }

      audio.currentTime = targetTime;
      progressRef.current = clamped;
      setProgress(clamped);
      setCurrentTimeSec(targetTime);
    },
    [miningPhase, resetMiningSession]
  );

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsExpanded(false);
    progressRef.current = 0;
    setProgress(0);
    setCurrentTimeSec(0);
    setMiningPhase("inactive");
    setMineResult(null);
    setVerifiedOverlayVisible(false);
    proofSentRef.current = false;
    completionTriggeredRef.current = false;
  }, []);

  const clearMineResult = useCallback(() => setMineResult(null), []);

  const dismissVerifiedOverlay = useCallback(() => {
    completionGenRef.current += 1;
    setVerifiedOverlayVisible(false);
    playNextInQueue();
  }, [playNextInQueue]);

  useEffect(() => {
    if (!currentTrack) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = currentTrack.fileUrl;
    audio.load();

    const onTimeUpdate = () => {
      // Visible playback is driven by rAF; timeupdate is a fallback when the tab is hidden.
      if (!document.hidden && isPlaying) return;

      const duration = effectiveDuration(currentTrack, audio.duration);
      if (!duration) return;

      const current = audio.currentTime;

      if (current >= duration - 0.05) {
        progressRef.current = 1;
        setProgress(1);
        setCurrentTimeSec(duration);
        void triggerCompletion(currentTrack);
        return;
      }

      const ratio = current / duration;
      progressRef.current = ratio;
      setProgress(ratio);
      setCurrentTimeSec(current);
    };

    const onEnded = async () => {
      await triggerCompletion(currentTrack);
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
  }, [currentTrack, isPlaying, triggerCompletion]);

  useEffect(() => {
    if (!currentTrack || !isPlaying) return;

    const audio = audioRef.current;
    if (!audio) return;

    let rafId = 0;

    const tick = () => {
      const track = currentTrackRef.current;
      const el = audioRef.current;
      if (!track || !el) return;

      const duration = effectiveDuration(track, el.duration);
      if (!duration) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const current = el.currentTime;

      if (current >= duration - 0.05) {
        progressRef.current = 1;
        setProgress(1);
        setCurrentTimeSec(duration);
        void triggerCompletion(track);
        return;
      }

      const ratio = current / duration;
      if (Math.abs(ratio - progressRef.current) >= 0.0003) {
        progressRef.current = ratio;
        setProgress(ratio);
        setCurrentTimeSec(current);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [currentTrack, isPlaying, triggerCompletion]);

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
        skipBack,
        skipForward,
        minimize,
        expand,
        seek,
        closePlayer,
        clearMineResult,
        verifiedOverlayVisible,
        dismissVerifiedOverlay,
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
