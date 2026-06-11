import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, getSession, setSessionCookie } from "@/lib/auth";
import {
  fetchProfileUser,
  writeGiveShareToArtists,
} from "@/lib/profile-user";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await fetchProfileUser(session.id, session);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, bio, walletAddress, giveShareToArtists } = body as {
      name?: string;
      bio?: string;
      walletAddress?: string | null;
      giveShareToArtists?: boolean;
    };

    const data: {
      name?: string;
      bio?: string | null;
      walletAddress?: string | null;
    } = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }
    if (typeof bio === "string") {
      data.bio = bio.trim() || null;
    }
    if (walletAddress === null || typeof walletAddress === "string") {
      data.walletAddress = walletAddress?.trim() || null;
    }

    await prisma.user.update({
      where: { id: session.id },
      data,
      select: { id: true },
    });

    if (typeof giveShareToArtists === "boolean") {
      await writeGiveShareToArtists(session.id, giveShareToArtists);
    }

    const sessionUser = await fetchProfileUser(session.id, session);
    if (!sessionUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const token = await createSession(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch {
    return NextResponse.json(
      { error: "Unable to update profile." },
      { status: 500 }
    );
  }
}
