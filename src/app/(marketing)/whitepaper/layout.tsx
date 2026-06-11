import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function WhitepaperLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MarketingShell theme="light">{children}</MarketingShell>;
}
