import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getJwtSecret } from "./env";
import { fetchProfileUser } from "./profile-user";
import { SESSION_COOKIE_NAME } from "./session";
import { sessionCookieDomain } from "./site-urls";
import type { SessionUser } from "./types";

function sessionCookieOptions(maxAge: number, domain?: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    ...(domain ? { domain } : {}),
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const embedded = payload.user as SessionUser | undefined;
    if (!embedded?.id) return null;

    const fresh = await fetchProfileUser(embedded.id);
    return fresh ?? embedded;
  } catch {
    return null;
  }
}

/** Drop a host-only session cookie (app subdomain stale sessions). */
export async function clearHostOnlySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    "",
    sessionCookieOptions(0)
  );
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const domain = sessionCookieDomain();

  cookieStore.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0));

  if (domain) {
    cookieStore.set(
      SESSION_COOKIE_NAME,
      "",
      sessionCookieOptions(0, domain)
    );
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  await clearSessionCookie();

  const cookieStore = await cookies();
  const domain = sessionCookieDomain();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(60 * 60 * 24 * 7, domain)
  );
}
