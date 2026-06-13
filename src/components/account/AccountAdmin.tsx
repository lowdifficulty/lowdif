"use client";

import { useEffect, useRef, useState } from "react";
import { loadSessionUser } from "@/lib/load-session-user";
import type { SessionUser, TrackWithArtist } from "@/lib/types";

interface AccountAdminProps {
  onUserLoaded?: (user: SessionUser) => void;
}

export function AccountAdmin({ onUserLoaded }: AccountAdminProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [giveShareToArtists, setGiveShareToArtists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myTracks, setMyTracks] = useState<TrackWithArtist[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadSessionUser()
      .then(({ user: loadedUser, unauthorized, error: loadError }) => {
        if (unauthorized || loadError) {
          if (loadError) setError(loadError);
          return;
        }
        if (!loadedUser) return;
        setUser(loadedUser);
        setName(loadedUser.name);
        setBio(loadedUser.bio ?? "");
        setWalletAddress(loadedUser.walletAddress ?? "");
        setGiveShareToArtists(Boolean(loadedUser.giveShareToArtists));
        onUserLoaded?.(loadedUser);
      })
      .finally(() => setLoading(false));
  }, [onUserLoaded]);

  useEffect(() => {
    if (!user?.id) return;

    fetch("/api/tracks/mine", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return [];
        const data = await r.json();
        return (data.tracks as TrackWithArtist[]) ?? [];
      })
      .then((tracks) => {
        setMyTracks(tracks);
        setSelectedTrackId((prev) => {
          if (prev && tracks.some((t) => t.id === prev)) return prev;
          return tracks[0]?.id ?? null;
        });
      })
      .catch(() => setMyTracks([]));
  }, [user?.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          walletAddress: walletAddress || null,
          giveShareToArtists,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setUser(data.user);
      onUserLoaded?.(data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTrack() {
    if (!selectedTrackId) return;

    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/tracks/${selectedTrackId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      const nextTracks = myTracks.filter((t) => t.id !== selectedTrackId);
      setMyTracks(nextTracks);
      setSelectedTrackId(nextTracks[0]?.id ?? null);
      setConfirmingDelete(false);
      setMessage(
        data.title ? `"${data.title}" deleted.` : "Track deleted."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUser(data.user);
      onUserLoaded?.(data.user);
      setMessage("Profile image updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading admin…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        {error ?? "Unable to load your account."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="ld-eyebrow mb-2">Admin portal</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Your account
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Update your profile, photo, and wallet for LOWDIF.
        </p>
      </div>

      <div className="ld-card p-6">
        <div className="mb-8 flex items-center gap-4">
          <div
            className="h-20 w-20 shrink-0 bg-ld-bg-secondary bg-cover bg-center"
            style={
              user.avatarUrl
                ? { backgroundImage: `url(${user.avatarUrl})` }
                : undefined
            }
          >
            {!user.avatarUrl && (
              <div className="flex h-full w-full items-center justify-center text-2xl font-black text-ld-text-muted">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-ld-text">Profile image</p>
            <p className="mt-1 text-xs text-ld-text-secondary">
              Square images work best.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarChange(e)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-3 border border-ld-border-strong px-4 py-2 text-xs font-bold tracking-widest text-ld-text uppercase transition hover:border-white hover:bg-white/5 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
          <div>
            <label className="ld-eyebrow mb-2 block" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full border border-ld-border bg-ld-bg-secondary px-3 py-2 text-sm text-ld-text-muted"
            />
          </div>

          <div>
            <label className="ld-eyebrow mb-2 block" htmlFor="name">
              Display name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ld-border bg-black px-3 py-2 text-sm text-ld-text focus:border-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="ld-eyebrow mb-2 block" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full resize-none border border-ld-border bg-black px-3 py-2 text-sm text-ld-text focus:border-white focus:outline-none"
              placeholder="Tell listeners about yourself…"
            />
          </div>

          <div>
            <label className="ld-eyebrow mb-2 block" htmlFor="wallet">
              Wallet address
            </label>
            <input
              id="wallet"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full border border-ld-border bg-black px-3 py-2 font-mono text-sm text-ld-text focus:border-white focus:outline-none"
              placeholder="0x…"
            />
          </div>

          {myTracks.length > 0 && (
            <div className="border border-ld-border bg-ld-bg-secondary p-4">
              <p className="ld-eyebrow mb-3">Your uploads</p>
              <ul className="space-y-2">
                {myTracks.map((track) => (
                  <li key={track.id}>
                    <label className="flex cursor-pointer items-center gap-3">
                      {myTracks.length > 1 && (
                        <input
                          type="radio"
                          name="delete-track"
                          checked={selectedTrackId === track.id}
                          onChange={() => setSelectedTrackId(track.id)}
                          className="accent-white"
                        />
                      )}
                      <div
                        className="h-10 w-10 shrink-0 bg-cover bg-center"
                        style={
                          track.coverUrl
                            ? { backgroundImage: `url(${track.coverUrl})` }
                            : undefined
                        }
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-ld-text">
                        {track.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-ld-border bg-ld-bg-secondary p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={giveShareToArtists}
                onChange={(e) => setGiveShareToArtists(e.target.checked)}
                className="mt-1 h-4 w-4 accent-white"
              />
              <span>
                <span className="block text-sm font-bold text-ld-text">
                  Give my mining share to artists
                </span>
                <span className="mt-1 block text-xs text-ld-text-secondary">
                  When enabled, LOWDIF you mint while listening is sent to the
                  track&apos;s artists instead of your wallet.
                </span>
              </span>
            </label>
          </div>

          {message && <p className="text-sm text-green-400">{message}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}

          {confirmingDelete && myTracks.length > 0 && (
            <div className="border border-red-500/30 bg-red-950/30 p-4">
              <p className="text-sm text-ld-text">
                Are you sure you want to delete?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDeleteTrack()}
                  className="flex-1 border-2 border-red-400 bg-red-400 py-2.5 text-xs font-bold tracking-widest text-black uppercase transition hover:bg-transparent hover:text-red-300 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes"}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 border border-ld-border-strong py-2.5 text-xs font-bold tracking-widest text-ld-text uppercase transition hover:border-white"
                >
                  No
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || deleting}
              className="flex-1 border-2 border-white bg-white py-3 text-xs font-bold tracking-widest text-black uppercase transition hover:bg-transparent hover:text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {myTracks.length > 0 && !confirmingDelete && (
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(true);
                  setError(null);
                  setMessage(null);
                }}
                className="border border-red-500/50 px-5 py-3 text-xs font-bold tracking-widest text-red-300 uppercase transition hover:border-red-300 hover:text-red-200"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
