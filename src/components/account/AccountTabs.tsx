"use client";

import Link from "next/link";

export type AccountTab = "profile" | "admin";

interface AccountTabsProps {
  active: AccountTab;
}

const TABS: { id: AccountTab; label: string; href: string }[] = [
  { id: "profile", label: "Profile", href: "/account" },
  { id: "admin", label: "Admin", href: "/account?tab=admin" },
];

export function AccountTabs({ active }: AccountTabsProps) {
  return (
    <div className="flex gap-1 border border-ld-border bg-ld-bg-secondary p-1">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.2em] uppercase transition sm:text-xs ${
              isActive
                ? "bg-white text-black"
                : "text-ld-text-secondary hover:text-ld-text"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
