"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountAdmin } from "@/components/account/AccountAdmin";
import { AccountTabs, type AccountTab } from "@/components/account/AccountTabs";
import { ProfileView } from "@/components/account/ProfileView";
import { loadSessionUser } from "@/lib/load-session-user";
import type { SessionUser } from "@/lib/types";

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: AccountTab =
    searchParams.get("tab") === "admin" ? "admin" : "profile";
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadSessionUser().then(({ user: loadedUser, unauthorized }) => {
      if (unauthorized) {
        router.push("/login");
        return;
      }
      setUser(loadedUser);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-ld-text-secondary">
        Unable to load your account.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AccountTabs active={tab} />
      {tab === "profile" ? (
        <ProfileView userId={user.id} isOwner />
      ) : (
        <AccountAdmin onUserLoaded={setUser} />
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-ld-text-secondary">
          Loading…
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
