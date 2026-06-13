"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

const CONTROL_BTN_FILLED =
  "flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14 bg-black/50 text-white transition hover:scale-105";
const CONTROL_ICON = "h-8 w-8 sm:h-9 sm:w-9";

function PlusIcon({ className = CONTROL_ICON }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

interface AddToPlaylistButtonProps {
  trackId: string;
  className?: string;
}

export function AddToPlaylistButton({
  trackId,
  className = CONTROL_BTN_FILLED,
}: AddToPlaylistButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "added" | "exists" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/playlists/mine/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trackId }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setStatus("error");
        setMessage("Sign in to save tracks.");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not add track.");
        return;
      }

      setStatus(data.added ? "added" : "exists");
      setMessage(data.message ?? "Added to My Playlist.");
      window.setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 2200);
    } catch {
      setStatus("error");
      setMessage("Could not add track.");
    }
  }, [trackId]);

  const label =
    status === "added" || status === "exists"
      ? message ?? "Added"
      : status === "error"
        ? message ?? "Sign in required"
        : "Add to My Playlist";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={status === "loading"}
        className={`${className} disabled:opacity-60`}
        aria-label={label}
        title={label}
      >
        {status === "added" || status === "exists" ? (
          <span className="text-lg font-bold">✓</span>
        ) : (
          <PlusIcon />
        )}
      </button>
      {message && status !== "idle" && (
        <p className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[10rem] -translate-x-1/2 rounded border border-ld-border bg-black/95 px-2 py-1 text-center text-[10px] text-white">
          {message}
          {status === "error" && message.includes("Sign in") && (
            <>
              {" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
