import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, getSession, setSessionCookie } from "@/lib/auth";
import { uploadPublicFile } from "@/lib/storage";
import { fetchProfileUser } from "@/lib/profile-user";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Avatar image is required." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image." },
        { status: 400 }
      );
    }

    const avatarUrl = await uploadPublicFile(file, "avatars");

    try {
      await prisma.user.update({
        where: { id: session.id },
        data: { avatarUrl },
        select: { id: true },
      });
    } catch {
      // avatarUrl column may be unavailable on stale Prisma clients
    }

    const sessionUser = await fetchProfileUser(session.id, {
      ...session,
      avatarUrl,
    });

    if (!sessionUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const token = await createSession({ ...sessionUser, avatarUrl });
    await setSessionCookie(token);

    return NextResponse.json({ user: { ...sessionUser, avatarUrl }, avatarUrl });
  } catch {
    return NextResponse.json(
      { error: "Unable to upload avatar." },
      { status: 500 }
    );
  }
}
