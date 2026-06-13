import type { Metadata } from "next";
import { JoinPage } from "@/components/marketing/JoinPage";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Join — LOWDIF Artist Grant",
  description:
    "Unleash your creative spirit. Sign up for the LOWDIF artist grant program.",
};

export default function JoinRoutePage() {
  return (
    <MarketingShell theme="dark" hideFooter hideNav>
      <JoinPage />
    </MarketingShell>
  );
}
