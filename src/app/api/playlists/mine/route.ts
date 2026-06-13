import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMyPlaylistWithTracks } from "@/lib/playlist-db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const data = await getMyPlaylistWithTracks(session.id);
  return NextResponse.json(data);
}
