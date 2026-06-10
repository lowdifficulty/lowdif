"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";

const marketingUrl =
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://lowdif.com";

export function Nav() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-ld-border bg-ld-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-ld-text"
        >
          LOWDIF
        </Link>

        <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-widest">
          <Link
            href="/stats"
            className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
          >
            Stats
          </Link>
          {user?.role === "ARTIST" && (
            <Link
              href="/artist/dashboard"
              className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
            >
              Artist Hub
            </Link>
          )}
          <a
            href={marketingUrl}
            className="hidden text-ld-text-secondary transition hover:text-ld-text md:inline"
          >
            About
          </a>
          {user ? (
            <>
              <span className="hidden text-ld-text-muted lg:inline">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="border border-ld-border-strong px-4 py-2 text-ld-text transition hover:border-ld-text hover:bg-white/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-ld-text-secondary transition hover:text-ld-text"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="border border-ld-border-strong px-4 py-2 text-ld-text transition hover:border-ld-text hover:bg-white/5"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
