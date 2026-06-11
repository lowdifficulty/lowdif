"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OwnershipSplitEditor } from "@/components/OwnershipSplitEditor";
import { SquareImageCropper } from "@/components/SquareImageCropper";
import type { OwnershipSplitInput } from "@/lib/ownership";
import { loadSessionUser } from "@/lib/load-session-user";
import type { SessionUser } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [durationSec, setDurationSec] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [croppedCover, setCroppedCover] = useState<Blob | null>(null);
  const [ownerWallet, setOwnerWallet] = useState("");
  const [coOwners, setCoOwners] = useState<OwnershipSplitInput[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadSessionUser()
      .then(({ user: loadedUser, unauthorized, error: loadError }) => {
        if (unauthorized) {
          router.push("/login");
          return;
        }
        if (loadError) {
          setError(loadError);
          return;
        }
        if (!loadedUser) return;
        setUser(loadedUser);
        setOwnerWallet(loadedUser.walletAddress ?? "");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!audio) {
      setError("Please select an audio file.");
      return;
    }
    if (!ownerWallet.trim()) {
      setError("Your wallet address is required for royalty distribution.");
      return;
    }

    const coTotal = coOwners.reduce(
      (sum, row) => sum + (Number(row.sharePercent) || 0),
      0
    );
    const ownerShare = 100 - coTotal;
    if (ownerShare <= 0) {
      setError("Your share must be greater than 0%.");
      return;
    }

    const ownershipSplits: OwnershipSplitInput[] = [
      { walletAddress: ownerWallet.trim(), sharePercent: ownerShare, label: "Uploader" },
      ...coOwners.filter((row) => row.walletAddress.trim()),
    ];

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("genre", genre);
    if (durationSec) formData.append("durationSec", durationSec);
    formData.append("audio", audio);
    if (croppedCover) {
      formData.append("cover", croppedCover, "cover.jpg");
    }
    formData.append("ownershipSplits", JSON.stringify(ownershipSplits));

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
      setCoverFile(null);
      setCroppedCover(null);
      setCoOwners([]);
      if (data.user) setUser(data.user);
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        {loading ? "Loading upload…" : (error || "Unable to load upload.")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="ld-eyebrow mb-2">Publish</p>
        <h1 className="text-3xl font-black tracking-tight text-ld-text">
          Upload track
        </h1>
        <p className="mt-2 text-ld-text-secondary">
          Add audio, square cover art, and set ownership splits for automatic
          LOWDIF distribution.
        </p>
      </div>

      <form onSubmit={(e) => void handleUpload(e)} className="space-y-6">
        <div className="ld-card space-y-4 p-6">
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
        </div>

        <div className="ld-card space-y-4 p-6">
          <div>
            <p className="ld-eyebrow mb-1">Cover art</p>
            <p className="text-xs text-ld-text-secondary">
              Upload any image — we center-crop it to a square for you.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ld-text-secondary file:mr-4 file:border file:border-ld-border file:bg-ld-card file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-widest file:text-ld-text"
              />
            </div>
            <SquareImageCropper file={coverFile} onCropped={setCroppedCover} />
          </div>
        </div>

        <OwnershipSplitEditor
          ownerWallet={ownerWallet}
          onOwnerWalletChange={setOwnerWallet}
          coOwners={coOwners}
          onCoOwnersChange={setCoOwners}
        />

        {error && (
          <p className="border border-red-500/30 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="border border-ld-border bg-ld-bg-secondary px-3 py-2 text-sm text-ld-text">
            {message}{" "}
            <Link href="/trending" className="underline hover:text-white">
              Back to trending
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="ld-btn-primary w-full text-center disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload track"}
        </button>
      </form>
    </div>
  );
}
