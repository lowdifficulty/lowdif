"use client";

import type { ShareTarget } from "@/lib/share";
import { useShare } from "./ShareProvider";

interface ShareButtonProps {
  target: ShareTarget;
  label?: string;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

export function ShareButton({
  target,
  label = "Share",
  className = "",
  compact = false,
  children,
}: ShareButtonProps) {
  const { openShare } = useShare();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        openShare(target);
      }}
      className={
        className ||
        `flex items-center justify-center border border-ld-border-strong text-ld-text-secondary transition hover:border-white hover:text-white ${
          compact ? "h-7 w-7 text-xs sm:h-8 sm:w-8" : "px-4 py-2 text-[10px] font-bold tracking-widest uppercase"
        }`
      }
    >
      {children ?? (compact ? "↗" : label)}
    </button>
  );
}
