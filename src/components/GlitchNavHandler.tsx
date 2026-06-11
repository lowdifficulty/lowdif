"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fireGlitch } from "@/lib/glitch-controller";
import {
  GLITCH_NAV_EVERY_N,
  GLITCH_TAKEOVER_ENABLED,
  isNavGlitchExemptPath,
} from "@/lib/glitch-takeover";

export function GlitchNavHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRoute = useRef(true);
  const navCountRef = useRef(0);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (!GLITCH_TAKEOVER_ENABLED) return;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    if (isNavGlitchExemptPath(pathname)) return;

    navCountRef.current += 1;
    if (navCountRef.current % GLITCH_NAV_EVERY_N !== 0) return;

    fireGlitch("nav");
  }, [routeKey, pathname]);

  return null;
}
