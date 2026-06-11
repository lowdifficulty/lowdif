"use client";

import { useRef, useState } from "react";

interface EmbedPlayerProps {
  track: {
    id: string;
    title: string;
    fileUrl: string;
    coverUrl: string | null;
    artistName: string;
  };
}

export function EmbedPlayer({ track }: EmbedPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={track.fileUrl}
        preload="none"
        onEnded={() => setPlaying(false)}
      />
      <div
        className="h-14 w-14 shrink-0 bg-cover bg-center"
        style={
          track.coverUrl
            ? { backgroundImage: `url(${track.coverUrl})` }
            : { backgroundColor: "#111" }
        }
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{track.title}</p>
        <p className="truncate text-xs text-white/60">{track.artistName}</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-white bg-white text-sm text-black"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "❚❚" : "▶"}
      </button>
    </div>
  );
}
