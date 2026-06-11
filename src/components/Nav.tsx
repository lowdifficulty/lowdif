"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";

interface NavProps {
  initialUser?: SessionUser | null;
}

export function Nav({ initialUser = null }: NavProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return initialUser;
        const data = await r.json();
        return (data.user as SessionUser | null) ?? initialUser;
      })
      .then((nextUser) => setUser(nextUser ?? null))
      .catch(() => setUser(initialUser));
  }, [pathname, initialUser]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-ld-border bg-ld-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/trending"
          className="text-xl font-black tracking-tight text-ld-text"
        >
          LOWDIF
        </Link>

        <nav className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest sm:gap-6">
          <Link
            href="/trending"
            className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
          >
            Trending
          </Link>
          <Link
            href="/playlists"
            className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
          >
            Playlists
          </Link>
          <Link
            href="/leaderboard"
            className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
          >
            Leaderboard
          </Link>
          <Link
            href="/stats"
            className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
          >
            Stats
          </Link>
          {user && (
            <Link
              href="/upload"
              className="hidden text-ld-text-secondary transition hover:text-ld-text sm:inline"
            >
              Upload
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/account"
                className="max-w-[7rem] truncate text-ld-text-muted transition hover:text-ld-text sm:max-w-[9rem]"
              >
                {user.name}
              </Link>
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
