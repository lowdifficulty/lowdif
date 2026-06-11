import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/LandingPage";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "LOWDIF — Music is the Mining Rig",
  description:
    "The first cryptocurrency mined by listening. Every completed play earns LOWDIF split equally between the listener and the artist.",
};

export default function HomePage() {
  return (
    <MarketingShell theme="dark">
      <LandingPage />
    </MarketingShell>
  );
}
