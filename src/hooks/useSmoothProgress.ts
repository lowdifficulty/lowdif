"use client";

import { useEffect, useRef, useState } from "react";

const SMOOTHING = 0.22;
const SNAP_EPSILON = 0.0008;
const SEEK_JUMP = 0.04;

/**
 * Eases visual progress toward the target each frame for fluid mining UI.
 */
export function useSmoothProgress(target: number, active: boolean): number {
  const [smooth, setSmooth] = useState(target);
  const smoothRef = useRef(target);
  const targetRef = useRef(target);

  targetRef.current = target;

  useEffect(() => {
    if (!active) {
      smoothRef.current = targetRef.current;
      setSmooth(targetRef.current);
      return;
    }

    if (targetRef.current <= 0.02) {
      smoothRef.current = 0;
      setSmooth(0);
    }

    let raf = 0;
    const tick = () => {
      const t = targetRef.current;
      const s = smoothRef.current;
      const delta = t - s;
      const next =
        Math.abs(delta) < SNAP_EPSILON ? t : s + delta * SMOOTHING;
      smoothRef.current = next;
      setSmooth(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  useEffect(() => {
    if (Math.abs(target - smoothRef.current) >= SEEK_JUMP) {
      smoothRef.current = target;
      setSmooth(target);
    }
  }, [target]);

  return smooth;
}
