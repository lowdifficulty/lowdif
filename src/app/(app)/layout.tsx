import { Suspense } from "react";
import { FullScreenPlayer } from "@/components/FullScreenPlayer";
import { Nav } from "@/components/Nav";
import { PlayerProvider } from "@/components/PlayerProvider";
import { PlayerBar } from "@/components/PlayerBar";
import { ShareDeepLinkHandler } from "@/components/ShareDeepLinkHandler";
import { ShareProvider } from "@/components/ShareProvider";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <PlayerProvider>
      <ShareProvider>
        <Suspense fallback={null}>
          <ShareDeepLinkHandler />
        </Suspense>
        <Nav initialUser={session} />
        <main className="mx-auto max-w-6xl px-4 pb-32 pt-24">{children}</main>
        <FullScreenPlayer />
        <PlayerBar />
      </ShareProvider>
    </PlayerProvider>
  );
}
