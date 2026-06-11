import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

export type MarketingTheme = "dark" | "light";

interface MarketingShellProps {
  theme?: MarketingTheme;
  children: React.ReactNode;
}

export function MarketingShell({
  theme = "dark",
  children,
}: MarketingShellProps) {
  const isLight = theme === "light";

  return (
    <div
      className={
        isLight
          ? "ld-marketing-light min-h-screen bg-white text-black"
          : "min-h-screen bg-black text-white"
      }
    >
      <MarketingNav theme={theme} />
      <main>{children}</main>
      <MarketingFooter theme={theme} />
    </div>
  );
}
