import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getShareStats, recordShareEvent } from "@/lib/share-db";
import type { ShareChannel } from "@/lib/share";

const CHANNELS: ShareChannel[] = [
  "copy",
  "embed",
  "tiktok",
  "facebook",
  "instagram",
  "email",
  "sms",
  "native",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId") ?? undefined;
  const playlistSlug = searchParams.get("playlistSlug") ?? undefined;

  if (!trackId && !playlistSlug) {
    return NextResponse.json(
      { error: "trackId or playlistSlug is required." },
      { status: 400 }
    );
  }

  const stats = await getShareStats({ trackId, playlistSlug });
  return NextResponse.json(stats);
}

export async function POST(request: Request) {
  const session = await getSession();

  try {
    const body = await request.json();
    const { trackId, playlistSlug, channel } = body as {
      trackId?: string;
      playlistSlug?: string;
      channel?: string;
    };

    if (!trackId && !playlistSlug) {
      return NextResponse.json(
        { error: "trackId or playlistSlug is required." },
        { status: 400 }
      );
    }

    if (!channel || !CHANNELS.includes(channel as ShareChannel)) {
      return NextResponse.json({ error: "Invalid share channel." }, { status: 400 });
    }

    await recordShareEvent({
      sharerId: session?.id,
      trackId: trackId ?? null,
      playlistSlug: playlistSlug ?? null,
      channel: channel as ShareChannel,
    });

    const stats = await getShareStats({
      trackId,
      playlistSlug,
    });

    return NextResponse.json({ ok: true, ...stats });
  } catch {
    return NextResponse.json({ error: "Unable to record share." }, { status: 500 });
  }
}
