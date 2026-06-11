"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MARKETING_NAV_LINKS } from "@/lib/marketing-content";
import type { SessionUser } from "@/lib/types";
import type { MarketingTheme } from "./MarketingShell";

interface MarketingNavProps {
  theme?: MarketingTheme;
}

export function MarketingNav({ theme = "dark" }: MarketingNavProps) {
  const isLight = theme === "light";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const headerClass = isLight
    ? "border-b border-black/10 bg-white/90"
    : "border-b border-white/10 bg-black/90";

  const logoClass = isLight
    ? "text-lg font-black tracking-tight text-black"
    : "text-lg font-black tracking-tight text-white";

  const linkClass = isLight
    ? "transition hover:text-black text-black/55"
    : "transition hover:text-white text-white/60";

  const ctaClass = isLight
    ? "border border-black/25 px-4 py-2 text-black transition hover:border-black hover:bg-black/5"
    : "border border-white/25 px-4 py-2 text-white transition hover:border-white hover:bg-white/5";

  const menuBtnClass = isLight
    ? "flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-black/20 lg:hidden"
    : "flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-white/20 lg:hidden";

  const barClass = isLight ? "block h-px w-5 bg-black transition" : "block h-px w-5 bg-white transition";

  const mobileNavClass = isLight
    ? "border-t border-black/10 bg-white px-6 py-6 lg:hidden"
    : "border-t border-white/10 bg-black px-6 py-6 lg:hidden";

  const mobileLinkClass = isLight
    ? "flex flex-col gap-4 text-xs font-bold tracking-[0.2em] text-black/65 uppercase"
    : "flex flex-col gap-4 text-xs font-bold tracking-[0.2em] text-white/70 uppercase";

  const mobileActiveClass = isLight ? "text-black" : "text-white";

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 backdrop-blur-md ${headerClass}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className={logoClass}>
          LOWDIF
        </Link>

        <nav
          className={`hidden items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase lg:flex ${linkClass}`}
        >
          {MARKETING_NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:opacity-100">
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/trending" className={ctaClass}>
              Open App
            </Link>
          ) : (
            <>
              <Link href="/login" className="transition hover:opacity-100">
                Login
              </Link>
              <Link href="/signup" className={ctaClass}>
                Join
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={menuBtnClass}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`${barClass} ${open ? "translate-y-[5px] rotate-45" : ""}`}
          />
          <span
            className={`${barClass} ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`${barClass} ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className={mobileNavClass}>
          <div className={mobileLinkClass}>
            {MARKETING_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${mobileActiveClass}`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link href="/trending" className={mobileActiveClass}>
                Open App
              </Link>
            ) : (
              <>
                <Link href="/login" className={mobileActiveClass}>
                  Login
                </Link>
                <Link href="/signup" className={mobileActiveClass}>
                  Join
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
