"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
  defaultRole?: "LISTENER" | "ARTIST";
  variant?: "dark" | "light";
}

export function AuthForm({
  mode,
  defaultRole = "LISTENER",
  variant = "dark",
}: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"LISTENER" | "ARTIST">(defaultRole);
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
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.user?.role === "ARTIST") {
        router.push("/artist/dashboard");
      } else {
        router.push("/");
      }
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
        <>
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
          {defaultRole === "LISTENER" && (
            <div>
              <label className={labelClass}>I am a</label>
              <div className="flex gap-2">
                {(["LISTENER", "ARTIST"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 border py-2 text-xs font-medium uppercase tracking-widest transition ${
                      role === r
                        ? isLight
                          ? "border-black bg-black text-white"
                          : "border-white bg-white text-black"
                        : isLight
                          ? "border-black/20 text-black/45 hover:border-black/40"
                          : "border-ld-border text-ld-text-muted hover:border-ld-border-strong"
                    }`}
                  >
                    {r === "LISTENER" ? "Listener" : "Artist"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
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
