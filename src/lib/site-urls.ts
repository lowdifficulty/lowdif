const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function parseOrigin(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export const marketingOrigin =
  parseOrigin(process.env.NEXT_PUBLIC_MARKETING_URL) ??
  parseOrigin(process.env.NEXT_PUBLIC_APP_URL);

export const appOrigin =
  parseOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
  parseOrigin(process.env.NEXT_PUBLIC_MARKETING_URL);

export function isSplitSite(): boolean {
  if (!marketingOrigin || !appOrigin) return false;
  return marketingOrigin.host !== appOrigin.host;
}

export function normalizeHost(host: string): string {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function isLocalHost(host: string): boolean {
  return LOCAL_HOSTS.has(normalizeHost(host));
}

export function hostMatchesOrigin(host: string, origin: URL | null): boolean {
  if (!origin) return false;
  const normalized = normalizeHost(host);
  const target = origin.host.toLowerCase();
  return normalized === target || normalized === `www.${target}`;
}

export function isMarketingHost(host: string): boolean {
  if (isLocalHost(host) || !isSplitSite()) return true;
  return hostMatchesOrigin(host, marketingOrigin);
}

export function isAppHost(host: string): boolean {
  if (isLocalHost(host) || !isSplitSite()) return true;
  return hostMatchesOrigin(host, appOrigin);
}

export function marketingHref(path: string): string {
  if (!isSplitSite() || !marketingOrigin) return path;
  return new URL(path, marketingOrigin).toString();
}

export function appHref(path: string): string {
  if (!isSplitSite() || !appOrigin) return path;
  return new URL(path, appOrigin).toString();
}

export function sessionCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production" || !isSplitSite()) return undefined;
  const appHost = appOrigin?.hostname ?? "";
  const marketingHost = marketingOrigin?.hostname ?? "";
  if (
    appHost.endsWith(".lowdif.com") &&
    (marketingHost === "lowdif.com" || marketingHost.endsWith(".lowdif.com"))
  ) {
    return ".lowdif.com";
  }
  return undefined;
}

export const MARKETING_ONLY_PATHS = ["/", "/whitepaper"] as const;

export const APP_PATH_PREFIXES = [
  "/trending",
  "/playlists",
  "/leaderboard",
  "/stats",
  "/upload",
  "/account",
  "/t",
  "/users",
  "/embed",
] as const;

export const AUTH_PATH_PREFIXES = ["/login", "/signup", "/artist/signup"] as const;

export function isMarketingPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/whitepaper" ||
    pathname.startsWith("/whitepaper/")
  );
}

export function isAppPath(pathname: string): boolean {
  return APP_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
