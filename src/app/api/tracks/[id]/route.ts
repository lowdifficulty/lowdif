import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
