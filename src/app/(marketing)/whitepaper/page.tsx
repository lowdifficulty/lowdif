import type { Metadata } from "next";
import { WhitepaperPage } from "@/components/marketing/WhitepaperPage";

export const metadata: Metadata = {
  title: "Whitepaper — LOWDIF",
  description:
    "LOWDIF token economics, Proof-of-Listen mechanism, and vision for listen-based mining.",
};

export default function WhitepaperRoute() {
  return <WhitepaperPage />;
}
