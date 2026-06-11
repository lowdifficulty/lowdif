"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ShareTarget } from "@/lib/share";
import { ShareSheet } from "./ShareSheet";

interface ShareContextValue {
  openShare: (target: ShareTarget) => void;
  closeShare: () => void;
  isOpen: boolean;
  target: ShareTarget | null;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function ShareProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ShareTarget | null>(null);
  const [sharerId, setSharerId] = useState<string | null>(null);
  const [sharerName, setSharerName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSharerId(data.user?.id ?? null);
        setSharerName(data.user?.name ?? null);
      })
      .catch(() => {
        setSharerId(null);
        setSharerName(null);
      });
  }, []);

  const openShare = useCallback((next: ShareTarget) => {
    setTarget(next);
  }, []);

  const closeShare = useCallback(() => {
    setTarget(null);
  }, []);

  return (
    <ShareContext.Provider
      value={{
        openShare,
        closeShare,
        isOpen: Boolean(target),
        target,
      }}
    >
      {children}
      {target && (
        <ShareSheet
          target={target}
          sharerId={sharerId}
          sharerName={sharerName}
          onClose={closeShare}
        />
      )}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) {
    throw new Error("useShare must be used within ShareProvider");
  }
  return ctx;
}
