"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";
import { marketingHref } from "@/lib/site-urls";

interface NavProps {
  initialUser?: SessionUser | null;
}

const NAV_LINKS = [
  { href: "/trending", label: "Trending" },
  { href: "/playlists", label: "Playlists" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/stats", label: "Stats" },
] as const;

export function Nav({ initialUser = null }: NavProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

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
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = marketingHref("/");
  }

  const linkClass = (href: string) =>
    `block py-2 text-xs font-medium uppercase tracking-widest transition ${
      pathname === href || pathname.startsWith(`${href}/`)
        ? "text-ld-text"
        : "text-ld-text-secondary hover:text-ld-text"
    }`;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-ld-border bg-ld-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/trending"
          className="shrink-0 text-xl font-black tracking-tight text-ld-text"
        >
          LOWDIF
        </Link>

        <nav className="hidden items-center gap-4 text-xs font-medium uppercase tracking-widest sm:flex sm:gap-6">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ld-text-secondary transition hover:text-ld-text"
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/upload"
              className="text-ld-text-secondary transition hover:text-ld-text"
            >
              Upload
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/account"
                className="max-w-[9rem] truncate text-ld-text-muted transition hover:text-ld-text"
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

        <div className="flex items-center gap-2 sm:hidden">
          {user ? (
            <Link
              href="/account"
              className="max-w-[5.5rem] truncate text-[10px] font-medium uppercase tracking-widest text-ld-text-muted"
            >
              {user.name}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[10px] font-medium uppercase tracking-widest text-ld-text-secondary"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-ld-border-strong"
          >
            <span
              className={`block h-0.5 w-5 bg-ld-text transition ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-ld-text transition ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-ld-text transition ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-16 z-40 bg-black/60 sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-50 border-b border-ld-border bg-ld-bg px-4 py-4 sm:hidden">
            <div className="space-y-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/upload"
                  className={linkClass("/upload")}
                  onClick={() => setMenuOpen(false)}
                >
                  Upload
                </Link>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="mt-3 w-full border border-ld-border-strong px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-ld-text"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="mt-3 block border border-ld-border-strong px-4 py-3 text-xs font-medium uppercase tracking-widest text-ld-text"
                  onClick={() => setMenuOpen(false)}
                >
                  Join
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
