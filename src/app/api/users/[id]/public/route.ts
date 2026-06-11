import { NextResponse } from "next/server";
import { fetchPublicProfile } from "@/lib/public-profile";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await fetchPublicProfile(id);

  if (!profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: { id: profile.id, name: profile.name },
    profile,
  });
}
