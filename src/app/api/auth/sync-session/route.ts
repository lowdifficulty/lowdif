import { NextResponse } from "next/server";
import { clearHostOnlySessionCookie } from "@/lib/auth";

/** After marketing-site login/signup, clear stale app-host session cookies. */
export async function GET(request: Request) {
  await clearHostOnlySessionCookie();

  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/trending";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/trending";

  return NextResponse.redirect(new URL(safeNext, request.url));
}
