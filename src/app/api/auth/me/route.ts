import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchProfileUser } from "@/lib/profile-user";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await fetchProfileUser(session.id, session);
  return NextResponse.json({ user });
}
