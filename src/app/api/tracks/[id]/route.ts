import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { coverForTitle } from "@/lib/covers";
import { validateOwnershipSplits, type OwnershipSplitInput } from "@/lib/ownership";
import { replaceTrackOwnership } from "@/lib/track-ownership-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const track = await prisma.track.findUnique({
    where: { id },
    include: {
      artist: { select: { id: true, name: true } },
    },
  });

  if (!track) {
    return NextResponse.json({ error: "Track not found." }, { status: 404 });
  }

  return NextResponse.json({
    track: {
      ...track,
      createdAt: track.createdAt.toISOString(),
    },
  });
}

async function assertTrackOwner(trackId: string, userId: string) {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { id: true, artistId: true, title: true },
  });

  if (!track) {
    return { error: NextResponse.json({ error: "Track not found." }, { status: 404 }) };
  }

  if (track.artistId !== userId) {
    return {
      error: NextResponse.json(
        { error: "You can only manage your own uploads." },
        { status: 403 }
      ),
    };
  }

  return { track };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const ownerCheck = await assertTrackOwner(id, session.id);
  if (ownerCheck.error) return ownerCheck.error;

  try {
    const body = await request.json();
    const { title, genre, durationSec, ownershipSplits } = body as {
      title?: string;
      genre?: string;
      durationSec?: number;
      ownershipSplits?: OwnershipSplitInput[];
    };

    const data: {
      title?: string;
      genre?: string;
      durationSec?: number;
    } = {};

    if (typeof title === "string" && title.trim()) {
      data.title = title.trim();
    }
    if (typeof genre === "string" && genre.trim()) {
      data.genre = genre.trim();
    }
    if (durationSec !== undefined) {
      const sec = Number(durationSec);
      if (Number.isFinite(sec) && sec >= 0) {
        data.durationSec = Math.round(sec);
      }
    }

    if (!Object.keys(data).length && !ownershipSplits) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    if (ownershipSplits) {
      const splitResult = validateOwnershipSplits(ownershipSplits);
      if (!splitResult.ok) {
        return NextResponse.json({ error: splitResult.error }, { status: 400 });
      }
      await replaceTrackOwnership(id, splitResult.splits);
    }

    const updated = await prisma.track.update({
      where: { id },
      data,
      include: { artist: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      track: {
        ...updated,
        coverUrl: updated.coverUrl ?? coverForTitle(updated.title),
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to update track." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const ownerCheck = await assertTrackOwner(id, session.id);
  if (ownerCheck.error) return ownerCheck.error;
  const track = ownerCheck.track!;

  await prisma.track.delete({ where: { id } });

  return NextResponse.json({ ok: true, title: track.title });
}
