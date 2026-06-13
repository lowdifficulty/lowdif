import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  addTrackToMyPlaylist,
  removeTrackFromMyPlaylist,
} from "@/lib/playlist-db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as { trackId?: string };
  const trackId = body.trackId?.trim();
  if (!trackId) {
    return NextResponse.json({ error: "trackId is required." }, { status: 400 });
  }

  const result = await addTrackToMyPlaylist(session.id, trackId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    added: result.added,
    message: result.message,
  });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId")?.trim();
  if (!trackId) {
    return NextResponse.json({ error: "trackId is required." }, { status: 400 });
  }

  const result = await removeTrackFromMyPlaylist(session.id, trackId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
