"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/lib/types";

export default function ArtistDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [durationSec, setDurationSec] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        if (data.user.role !== "ARTIST") {
          router.push("/");
          return;
        }
        setUser(data.user);
      });
  }, [router]);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!audio) {
      setError("Please select an audio file.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("genre", genre);
    if (durationSec) formData.append("durationSec", durationSec);
    formData.append("audio", audio);
    if (cover) formData.append("cover", cover);

    try {
      const res = await fetch("/api/tracks/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setMessage(`"${data.track.title}" uploaded successfully.`);
      setTitle("");
      setDurationSec("");
      setAudio(null);
      setCover(null);
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading artist hub...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div>
        <p className="ld-eyebrow mb-2">Artist portal</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Artist Hub
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Welcome, {user.name}. Upload new tracks and view stats.
        </p>
      </div>

      <form onSubmit={handleUpload} className="ld-card space-y-4 p-6">
        <h2 className="text-lg font-bold text-ld-text">Upload track</h2>

        <div>
          <label className="ld-label">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ld-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="ld-label">Genre</label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="ld-input"
            />
          </div>
          <div>
            <label className="ld-label">Duration (seconds)</label>
            <input
              type="number"
              min={1}
              value={durationSec}
              onChange={(e) => setDurationSec(e.target.value)}
              placeholder="180"
              className="ld-input"
            />
          </div>
        </div>

        <div>
          <label className="ld-label">Audio file</label>
          <input
            required
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-ld-text-secondary file:mr-4 file:border-2 file:border-white file:bg-white file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-black"
          />
        </div>

        <div>
          <label className="ld-label">Cover art (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-ld-text-secondary file:mr-4 file:border file:border-ld-border file:bg-ld-card file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-widest file:text-ld-text"
          />
        </div>

        {error && (
          <p className="border border-red-500/30 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="border border-ld-border bg-ld-bg-secondary px-3 py-2 text-sm text-ld-text">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="ld-btn-primary w-full text-center disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload track"}
        </button>
      </form>

      <p className="text-center text-sm text-ld-text-secondary">
        <Link
          href="/stats"
          className="text-xs font-medium uppercase tracking-widest text-ld-text-secondary transition hover:text-ld-text"
        >
          View your stats dashboard →
        </Link>
      </p>
    </div>
  );
}
