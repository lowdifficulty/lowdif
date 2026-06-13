"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  clearStoredReferral,
  getStoredReferral,
} from "@/lib/share-referral";
import { appHref, isSplitSite } from "@/lib/site-urls";

interface AuthFormProps {
  mode: "login" | "signup";
  variant?: "dark" | "light";
  redirectTo?: string;
  defaultEmail?: string;
}

export function AuthForm({
  mode,
  variant = "dark",
  redirectTo = "/trending",
  defaultEmail = "",
}: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLight = variant === "light";
  const inputClass = isLight ? "ld-input-light" : "ld-input";
  const labelClass = isLight ? "ld-label-light" : "ld-label";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const { refId } = getStoredReferral();
      const body =
        mode === "login"
          ? { email, password }
          : {
              email,
              password,
              name,
              referredById: refId ?? undefined,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (mode === "signup") {
        clearStoredReferral();
      }

      const destination = isSplitSite()
        ? appHref(
            `/api/auth/sync-session?next=${encodeURIComponent(redirectTo)}`
          )
        : appHref(redirectTo);

      if (isSplitSite()) {
        window.location.assign(destination);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "signup" && (
        <div>
          <label className={labelClass}>Username</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p
          className={`px-3 py-2 text-sm ${
            isLight
              ? "border border-red-300 bg-red-50 text-red-700"
              : "border border-red-500/30 bg-red-950/50 text-red-300"
          }`}
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="ld-btn-dark">
        {loading
          ? "Please wait..."
          : mode === "login"
            ? "Sign In"
            : "Register"}
      </button>

      <p
        className={`text-center text-sm ${
          isLight ? "text-black/45" : "text-ld-text-muted"
        }`}
      >
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link
              href="/signup"
              className={isLight ? "text-black underline" : "text-ld-text underline"}
            >
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className={isLight ? "text-black underline" : "text-ld-text underline"}
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
