import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOWDIF — Listen & Mine",
  description:
    "The first cryptocurrency mined by listening. Stream music and earn LOWDIF tokens via proof-of-listen.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
