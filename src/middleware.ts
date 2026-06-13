import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import {
  appHref,
  appOrigin,
  isAppHost,
  isAppPath,
  isAuthPath,
  isMarketingHost,
  isMarketingPath,
  isSplitSite,
  marketingHref,
  marketingOrigin,
  normalizeHost,
} from "@/lib/site-urls";
import { isTrackSharePath } from "@/lib/share-slug";

const PROTECTED_PREFIXES = ["/upload", "/account", "/stats"];

function redirectTo(url: string, request: NextRequest): NextResponse {
  const target = new URL(url);
  if (request.nextUrl.search) {
    target.search = request.nextUrl.search;
  }
  return NextResponse.redirect(target);
}

function routeByHost(request: NextRequest): NextResponse | null {
  if (!isSplitSite() || !marketingOrigin || !appOrigin) return null;

  const host = normalizeHost(request.headers.get("host") ?? "");
  const { pathname } = request.nextUrl;

  if (isAppHost(host)) {
    if (pathname === "/") {
      return redirectTo(appHref("/trending"), request);
    }
    if (isMarketingPath(pathname)) {
      return redirectTo(marketingHref(pathname), request);
    }
    if (isAuthPath(pathname)) {
      return redirectTo(marketingHref(pathname), request);
    }
    return null;
  }

  if (isMarketingHost(host)) {
    if (isAppPath(pathname) || isTrackSharePath(pathname)) {
      return redirectTo(appHref(pathname), request);
    }
    return null;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const hostRoute = routeByHost(request);
  if (hostRoute) return hostRoute;

  const { pathname } = request.nextUrl;
  if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const loginBase = isSplitSite() ? marketingHref("/login") : new URL("/login", request.url).toString();
  const loginUrl = new URL(loginBase);
  loginUrl.searchParams.set("next", pathname);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|covers|uploads|ads).*)",
  ],
};
