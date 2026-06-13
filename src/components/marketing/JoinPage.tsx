"use client";

import { FormEvent, useState } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { marketingHref } from "@/lib/site-urls";

const joinDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-join-display",
});

const joinSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-join-sans",
});

export function JoinPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    const signupUrl = new URL(marketingHref("/signup"));
    signupUrl.searchParams.set("email", trimmed);
    window.location.assign(signupUrl.toString());
  }

  return (
    <section
      className={`${joinDisplay.variable} ${joinSans.variable} ld-join-page flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center`}
    >
      <div className="mx-auto w-full max-w-3xl">
        <p className="ld-join-logo text-white">LOWDIF</p>

        <h1 className="ld-join-headline mt-8 text-white">
          Unleash your creative spirit.
        </h1>

        <p className="ld-join-body mx-auto mt-8 max-w-xl text-white/65">
          Are you or a friend an up and coming artist?
          <br className="hidden sm:inline" />
          <span className="sm:ml-1">
            Sign up for our $1,000 per month grant program!
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="ld-join-form mx-auto mt-12 max-w-md"
        >
          <div className="ld-join-form-row">
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="Email address"
              className="ld-join-input"
              aria-label="Email address"
            />
            <button type="submit" className="ld-join-cta shrink-0">
              Get Started
            </button>
          </div>
          {error && (
            <p className="ld-join-error mt-3 text-left" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
