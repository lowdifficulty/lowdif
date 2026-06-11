"use client";

import Link from "next/link";

interface SharedByBannerProps {
  sharerName: string | null;
}

export function SharedByBanner({ sharerName }: SharedByBannerProps) {
  if (!sharerName) return null;

  return (
    <div className="border border-ld-border bg-ld-bg-secondary px-4 py-3 text-sm text-ld-text-secondary">
      <span className="font-bold text-ld-text">{sharerName}</span> shared this
      with you.{" "}
      <Link href="/signup" className="text-white underline hover:no-underline">
        Join LOWDIF
      </Link>{" "}
      to mine tokens while you listen.
    </div>
  );
}
