import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { uploadPublicFile } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ARTIST") {
    return NextResponse.json(
      { error: "Artist account required to upload tracks." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const genre = String(formData.get("genre") ?? "Electronic").trim();
    const durationSec = Number(formData.get("durationSec") ?? 0);
    const audioFile = formData.get("audio") as File | null;
    const coverFile = formData.get("cover") as File | null;

    if (!title || !audioFile) {
      return NextResponse.json(
        { error: "Title and audio file are required." },
        { status: 400 }
      );
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

    return NextResponse.json({
      track: {
        ...track,
        createdAt: track.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
