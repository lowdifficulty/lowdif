import type { SessionUser } from "./types";

/** Load the signed-in user, preferring /api/profile with /api/auth/me fallback. */
export async function loadSessionUser(): Promise<{
  user: SessionUser | null;
  unauthorized: boolean;
  error: string | null;
}> {
  const profileRes = await fetch("/api/profile", { credentials: "include" });

  if (profileRes.status === 401) {
    return { user: null, unauthorized: true, error: null };
  }

  if (profileRes.ok) {
    const data = await profileRes.json();
    if (data.user) {
      return { user: data.user as SessionUser, unauthorized: false, error: null };
    }
  }

  const meRes = await fetch("/api/auth/me", { credentials: "include" });
  if (meRes.ok) {
    const data = await meRes.json();
    if (data.user) {
      return { user: data.user as SessionUser, unauthorized: false, error: null };
    }
  }

  return {
    user: null,
    unauthorized: false,
    error: "Unable to load your account. Try signing in again.",
  };
}
