import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

export type MarketingTheme = "dark" | "light";

interface MarketingShellProps {
  theme?: MarketingTheme;
  hideFooter?: boolean;
  hideNav?: boolean;
  children: React.ReactNode;
}

export function MarketingShell({
  theme = "dark",
  hideFooter = false,
  hideNav = false,
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
      {!hideNav && <MarketingNav theme={theme} />}
      <main>{children}</main>
      {!hideFooter && <MarketingFooter theme={theme} />}
    </div>
  );
}
