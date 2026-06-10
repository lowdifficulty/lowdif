import { FullScreenPlayer } from "@/components/FullScreenPlayer";
import { Nav } from "@/components/Nav";
import { PlayerProvider } from "@/components/PlayerProvider";
import { PlayerBar } from "@/components/PlayerBar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlayerProvider>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-24">{children}</main>
      <FullScreenPlayer />
      <PlayerBar />
    </PlayerProvider>
  );
}
