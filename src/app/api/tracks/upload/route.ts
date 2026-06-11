import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, getSession, setSessionCookie } from "@/lib/auth";
import { uploadPublicFile } from "@/lib/storage";
import {
  validateOwnershipSplits,
  type OwnershipSplitInput,
} from "@/lib/ownership";
import { fetchProfileUser } from "@/lib/profile-user";
import { insertTrackOwnership } from "@/lib/track-ownership-db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to upload tracks." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const genre = String(formData.get("genre") ?? "Electronic").trim();
    const durationSec = Number(formData.get("durationSec") ?? 0);
    const audioFile = formData.get("audio") as File | null;
    const coverFile = formData.get("cover") as File | null;
    const splitsRaw = String(formData.get("ownershipSplits") ?? "[]");

    if (!title || !audioFile) {
      return NextResponse.json(
        { error: "Title and audio file are required." },
        { status: 400 }
      );
    }

    let parsedSplits: OwnershipSplitInput[];
    try {
      parsedSplits = JSON.parse(splitsRaw) as OwnershipSplitInput[];
    } catch {
      return NextResponse.json(
        { error: "Invalid ownership split data." },
        { status: 400 }
      );
    }

    const splitResult = validateOwnershipSplits(parsedSplits);
    if (!splitResult.ok) {
      return NextResponse.json({ error: splitResult.error }, { status: 400 });
    }

    const fileUrl = await uploadPublicFile(audioFile, "audio");

    let coverUrl: string | null = null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadPublicFile(coverFile, "covers");
    }

    const track = await prisma.track.create({
      data: {
        title,
        genre,
        durationSec: Number.isFinite(durationSec) ? durationSec : 0,
        fileUrl,
        coverUrl,
        artistId: session.id,
      },
      include: {
        artist: { select: { id: true, name: true } },
      },
    });

    await insertTrackOwnership(track.id, splitResult.splits);

    const sessionUser = await fetchProfileUser(session.id, session);

    if (sessionUser) {
      const token = await createSession(sessionUser);
      await setSessionCookie(token);
    }

    return NextResponse.json({
      track: {
        ...track,
        createdAt: track.createdAt.toISOString(),
      },
      user: sessionUser ?? session,
    });
  } catch (err) {
    console.error("Track upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
