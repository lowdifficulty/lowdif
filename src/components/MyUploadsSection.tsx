"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatLowdifMinted } from "@/lib/display";
import type { TrackWithArtist } from "@/lib/types";

interface EditDraft {
  title: string;
  genre: string;
}

export function MyUploadsSection() {
  const [tracks, setTracks] = useState<TrackWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tracks/mine", { credentials: "include" });
      if (!res.ok) {
        setTracks([]);
        return;
      }
      const data = await res.json();
      setTracks((data.tracks as TrackWithArtist[]) ?? []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  function startEdit(track: TrackWithArtist) {
    setEditingId(track.id);
    setEditDraft({
      title: track.title,
      genre: track.genre,
    });
    setConfirmingDeleteId(null);
    setError(null);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function saveEdit(trackId: string) {
    if (!editDraft) return;

    setSavingId(trackId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editDraft.title,
          genre: editDraft.genre,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? (data.track as TrackWithArtist) : t))
      );
      setMessage(`"${data.track.title}" updated.`);
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTrack(trackId: string) {
    setDeletingId(trackId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/tracks/${trackId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      setMessage(data.title ? `"${data.title}" deleted.` : "Track deleted.");
      setConfirmingDeleteId(null);
      if (editingId === trackId) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="ld-card p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ld-text">My uploads</h2>
          <p className="mt-1 text-sm text-ld-text-secondary">
            Edit or remove tracks you&apos;ve published.
          </p>
        </div>
        <Link
          href="/upload"
          className="text-xs font-medium uppercase tracking-widest text-ld-text-secondary transition hover:text-ld-text"
        >
          Upload new →
        </Link>
      </div>

      {message && <p className="mb-4 text-sm text-green-400">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-ld-text-secondary">Loading uploads…</p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-ld-text-secondary">
          No uploads yet.{" "}
          <Link href="/upload" className="text-ld-text underline hover:text-white">
            Upload a track
          </Link>{" "}
          to see it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {tracks.map((track) => {
            const isEditing = editingId === track.id;
            const isConfirmingDelete = confirmingDeleteId === track.id;

            return (
              <li
                key={track.id}
                className="border border-ld-border bg-ld-bg-secondary p-4"
              >
                <div className="flex gap-3 sm:items-start">
                  <div
                    className="h-14 w-14 shrink-0 bg-cover bg-center"
                    style={
                      track.coverUrl
                        ? { backgroundImage: `url(${track.coverUrl})` }
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    {isEditing && editDraft ? (
                      <div className="space-y-3">
                        <div>
                          <label className="ld-label">Title</label>
                          <input
                            value={editDraft.title}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, title: e.target.value })
                            }
                            className="ld-input"
                          />
                        </div>
                        <div>
                          <label className="ld-label">Genre</label>
                          <input
                            value={editDraft.genre}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, genre: e.target.value })
                            }
                            className="ld-input"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={savingId === track.id}
                            onClick={() => void saveEdit(track.id)}
                            className="border-2 border-white bg-white px-4 py-2 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-transparent hover:text-white disabled:opacity-50"
                          >
                            {savingId === track.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="border border-ld-border-strong px-4 py-2 text-[10px] font-bold tracking-widest text-ld-text uppercase transition hover:border-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="truncate font-bold text-ld-text">
                          {track.title}
                        </p>
                        <p className="text-sm text-ld-text-secondary">
                          {track.genre}
                          {track.durationSec > 0 && (
                            <>
                              {" "}
                              · {Math.floor(track.durationSec / 60)}:
                              {(track.durationSec % 60).toString().padStart(2, "0")}
                            </>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-ld-text-muted">
                          {formatLowdifMinted(track.playCount)} ·{" "}
                          {new Date(track.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => startEdit(track)}
                        className="border border-ld-border-strong px-3 py-2 text-[10px] font-bold tracking-widest text-ld-text uppercase transition hover:border-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingDeleteId(track.id);
                          setError(null);
                          setMessage(null);
                        }}
                        className="border border-red-500/50 px-3 py-2 text-[10px] font-bold tracking-widest text-red-300 uppercase transition hover:border-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {isConfirmingDelete && (
                  <div className="mt-4 border border-red-500/30 bg-red-950/30 p-3">
                    <p className="text-sm text-ld-text">
                      Are you sure you want to delete?
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={deletingId === track.id}
                        onClick={() => void deleteTrack(track.id)}
                        className="flex-1 border-2 border-red-400 bg-red-400 py-2 text-xs font-bold tracking-widest text-black uppercase transition hover:bg-transparent hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === track.id ? "Deleting…" : "Yes"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === track.id}
                        onClick={() => setConfirmingDeleteId(null)}
                        className="flex-1 border border-ld-border-strong py-2 text-xs font-bold tracking-widest text-ld-text uppercase transition hover:border-white"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
