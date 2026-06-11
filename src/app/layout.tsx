import type { Metadata } from "next";
import { Suspense } from "react";
import { GlitchNavHandler } from "@/components/GlitchNavHandler";
import { GlitchTakeover } from "@/components/GlitchTakeover";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOWDIF — Music is the Mining Rig",
  description:
    "The first cryptocurrency mined by listening. Every completed play earns LOWDIF split equally between the listener and the artist.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Suspense fallback={null}>
          <GlitchNavHandler />
        </Suspense>
        <GlitchTakeover />
      </body>
    </html>
  );
}
