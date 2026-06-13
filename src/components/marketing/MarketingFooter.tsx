import Link from "next/link";
import { CONTRACT_ADDRESS } from "@/lib/marketing-content";
import { appHref } from "@/lib/site-urls";
import type { MarketingTheme } from "./MarketingShell";

interface MarketingFooterProps {
  theme?: MarketingTheme;
}

export function MarketingFooter({ theme = "dark" }: MarketingFooterProps) {
  const isLight = theme === "light";

  const footerClass = isLight
    ? "border-t border-black/10 bg-white px-6 py-16"
    : "border-t border-white/10 bg-black px-6 py-16";

  const titleClass = isLight
    ? "text-lg font-black tracking-tight text-black"
    : "text-lg font-black tracking-tight text-white";

  const subtitleClass = isLight
    ? "mt-2 text-sm text-black/50"
    : "mt-2 text-sm text-white/50";

  const linkClass = isLight
    ? "transition hover:text-black text-black/55"
    : "transition hover:text-white text-white/60";

  const dividerClass = isLight
    ? "mt-12 border-t border-black/10 pt-8"
    : "mt-12 border-t border-white/10 pt-8";

  const labelClass = isLight
    ? "text-[10px] tracking-[0.15em] text-black/40 uppercase"
    : "text-[10px] tracking-[0.15em] text-white/40 uppercase";

  const monoClass = isLight
    ? "mt-2 break-all font-mono text-xs text-black/65"
    : "mt-2 break-all font-mono text-xs text-white/70";

  const copyClass = isLight
    ? "mt-8 text-[10px] tracking-widest text-black/35 uppercase"
    : "mt-8 text-[10px] tracking-widest text-white/30 uppercase";

  return (
    <footer className={footerClass}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={titleClass}>LOWDIF</p>
            <p className={subtitleClass}>Music is the Mining Rig.</p>
          </div>

          <nav
            className={`flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-bold tracking-[0.2em] uppercase ${linkClass}`}
          >
            <Link href="/" className="transition hover:opacity-100">
              Home
            </Link>
            <Link href="/whitepaper" className="transition hover:opacity-100">
              Whitepaper
            </Link>
            <Link href="/signup" className="transition hover:opacity-100">
              Join
            </Link>
            <Link href="/login" className="transition hover:opacity-100">
              Login
            </Link>
            <Link href={appHref("/trending")} className="transition hover:opacity-100">
              App
            </Link>
          </nav>
        </div>

        <div className={dividerClass}>
          <p className={labelClass}>Contract Address</p>
          <p className={monoClass}>{CONTRACT_ADDRESS}</p>
          <p className={copyClass}>
            © {new Date().getFullYear()} LOWDIF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
