"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildEmbedCode,
  buildShareMessage,
  buildShareTitle,
  buildShareUrl,
  getShareCoverUrl,
  socialShareUrls,
  type ShareChannel,
  type ShareTarget,
} from "@/lib/share";

interface ShareSheetProps {
  target: ShareTarget;
  sharerId: string | null;
  sharerName: string | null;
  onClose: () => void;
}

interface ShareStats {
  count: number;
  recentSharers: string[];
}

export function ShareSheet({
  target,
  sharerId,
  sharerName,
  onClose,
}: ShareSheetProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [stats, setStats] = useState<ShareStats>({ count: 0, recentSharers: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  const isTrack = target.type === "track";
  const shareUrl = buildShareUrl(target, sharerId);
  const shareText = buildShareMessage(target, sharerName);
  const shareTitle = buildShareTitle(target);
  const coverUrl = getShareCoverUrl(target);
  const social = socialShareUrls(shareUrl, shareText);
  const embedCode =
    isTrack && target.track ? buildEmbedCode(target.track.id) : "";

  const trackId = target.type === "track" ? target.track?.id : undefined;
  const playlistSlug =
    target.type === "playlist" ? target.playlist?.slug : undefined;

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const params = new URLSearchParams();
      if (trackId) params.set("trackId", trackId);
      if (playlistSlug) params.set("playlistSlug", playlistSlug);
      const res = await fetch(`/api/share?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          count: data.count ?? 0,
          recentSharers: data.recentSharers ?? [],
        });
      }
    } catch {
      /* best effort */
    } finally {
      setLoadingStats(false);
    }
  }, [trackId, playlistSlug]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function recordShare(channel: ShareChannel) {
    try {
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, playlistSlug, channel }),
      });
      void loadStats();
    } catch {
      /* best effort */
    }
  }

  async function copyText(text: string, channel: ShareChannel, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      void recordShare(channel);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function openWindow(channel: ShareChannel, url: string) {
    void recordShare(channel);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  const subtitle =
    target.type === "track"
      ? target.track?.artist.name
      : `${target.playlist?.trackCount ?? 0} tracks`;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close share"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto border border-ld-border bg-ld-bg shadow-2xl sm:mx-4">
        <div className="flex items-start justify-between border-b border-ld-border px-5 py-4">
          <div>
            <p className="ld-eyebrow mb-1">Spread the mine</p>
            <h2 id="share-title" className="text-lg font-black tracking-tight text-ld-text">
              Share
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-ld-border-strong text-ld-text-secondary transition hover:border-white hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 flex gap-4">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="h-20 w-20 shrink-0 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-ld-card text-2xl text-ld-text-muted">
                ♪
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-ld-text">{shareTitle}</p>
              <p className="truncate text-sm text-ld-text-secondary">{subtitle}</p>
              {!loadingStats && stats.count > 0 && (
                <p className="mt-2 text-xs text-ld-text-muted">
                  Shared {stats.count.toLocaleString()} time
                  {stats.count === 1 ? "" : "s"}
                  {stats.recentSharers.length > 0 && (
                    <> · {stats.recentSharers.slice(0, 2).join(", ")}</>
                  )}
                </p>
              )}
            </div>
          </div>

          <p className="mb-4 text-xs leading-relaxed text-ld-text-secondary">
            {shareText}
          </p>

          {isTrack ? (
            <>
              <p className="ld-eyebrow mb-3">Share song</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SocialButton
                  label={copied === "TikTok" ? "Copied" : "TikTok"}
                  onClick={() =>
                    void copyText(`${shareText} ${shareUrl}`, "tiktok", "TikTok")
                  }
                />
                <SocialButton
                  label="Facebook"
                  onClick={() => openWindow("facebook", social.facebook)}
                />
                <SocialButton
                  label={copied === "Instagram" ? "Copied" : "Instagram"}
                  onClick={() =>
                    void copyText(`${shareText} ${shareUrl}`, "instagram", "Instagram")
                  }
                />
                <SocialButton
                  label="Email"
                  onClick={() => {
                    void recordShare("email");
                    window.location.href = social.email;
                  }}
                />
                <SocialButton
                  label="SMS"
                  onClick={() => {
                    void recordShare("sms");
                    window.location.href = social.sms;
                  }}
                />
                <SocialButton
                  label={copied === "Copy link" ? "Copied" : "Copy link"}
                  onClick={() => void copyText(shareUrl, "copy", "Copy link")}
                />
                <SocialButton
                  label="Embed"
                  onClick={() => {
                    setShowEmbed((v) => !v);
                    void recordShare("embed");
                  }}
                />
              </div>

              {showEmbed && embedCode && (
                <div className="mt-4 border border-ld-border bg-black p-3">
                  <p className="ld-eyebrow mb-2">Embed code</p>
                  <textarea
                    readOnly
                    value={embedCode}
                    rows={3}
                    className="mb-2 w-full resize-none border border-ld-border bg-ld-bg-secondary p-2 font-mono text-[10px] text-ld-text-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => void copyText(embedCode, "embed", "Embed")}
                    className="w-full border border-ld-border-strong py-2 text-[10px] font-bold tracking-widest text-ld-text uppercase transition hover:border-white hover:text-white"
                  >
                    {copied === "Embed" ? "Copied" : "Copy embed code"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="min-w-0 flex-1 border border-ld-border bg-black px-3 py-2 font-mono text-[11px] text-ld-text-secondary"
                />
                <button
                  type="button"
                  onClick={() => void copyText(shareUrl, "copy", "Copy link")}
                  className="shrink-0 border-2 border-white bg-white px-4 py-2 text-[10px] font-bold tracking-widest text-black uppercase transition hover:bg-transparent hover:text-white"
                >
                  {copied === "Copy link" ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="ld-eyebrow mb-3">Share to</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SocialButton
                  label="Facebook"
                  onClick={() => openWindow("facebook", social.facebook)}
                />
                <SocialButton
                  label="Email"
                  onClick={() => {
                    void recordShare("email");
                    window.location.href = social.email;
                  }}
                />
                <SocialButton
                  label="SMS"
                  onClick={() => {
                    void recordShare("sms");
                    window.location.href = social.sms;
                  }}
                />
                <SocialButton
                  label={copied === "Copy link" ? "Copied" : "Copy link"}
                  onClick={() => void copyText(shareUrl, "copy", "Copy link")}
                />
              </div>
            </>
          )}

          {sharerId && (
            <p className="mt-4 text-[10px] leading-relaxed text-ld-text-muted">
              Your link includes a referral — when friends join and listen, it
              counts toward your share stats.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-ld-border bg-ld-card px-2 py-2.5 text-[10px] font-bold tracking-wide text-ld-text-secondary uppercase transition hover:border-white hover:text-white"
    >
      {label}
    </button>
  );
}
