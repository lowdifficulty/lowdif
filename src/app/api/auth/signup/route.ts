import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { toSessionUser } from "@/lib/session-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, referredById } = body as {
      email?: string;
      password?: string;
      name?: string;
      referredById?: string;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    let validReferrerId: string | undefined;
    if (typeof referredById === "string" && referredById.trim()) {
      const referrer = await prisma.user.findUnique({
        where: { id: referredById.trim() },
        select: { id: true },
      });
      if (referrer) validReferrerId = referrer.id;
    }

    const passwordHash = await hashPassword(password);
    const userData = {
      email,
      name,
      passwordHash,
      role: "LISTENER" as const,
      ...(validReferrerId ? { referredById: validReferrerId } : {}),
    };

    const user = await prisma.user.create({ data: userData });

    const sessionUser = toSessionUser(user);
    const token = await createSession(sessionUser);

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 }
    );
  }
}
