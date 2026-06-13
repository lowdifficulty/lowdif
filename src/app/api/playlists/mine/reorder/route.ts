import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { reorderMyPlaylist } from "@/lib/playlist-db";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as { trackIds?: string[] };
  const trackIds = body.trackIds;
  if (!Array.isArray(trackIds) || trackIds.length === 0) {
    return NextResponse.json(
      { error: "trackIds array is required." },
      { status: 400 }
    );
  }

  const result = await reorderMyPlaylist(session.id, trackIds);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
