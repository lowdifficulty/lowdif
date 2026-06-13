"use client";

import { FormEvent, useState } from "react";
import { Montserrat } from "next/font/google";
import { marketingHref } from "@/lib/site-urls";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-join-montserrat",
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
    <section className={`${montserrat.variable} ld-join-page`}>
      <div className="ld-join-inner">
        <p className="ld-join-logo" aria-label="LOWDIF">
          <span className="ld-join-logo-desktop">LOWDIF</span>
          <span className="ld-join-logo-mobile" aria-hidden="true">
            {(["L", "O", "W", "D", "I", "F"] as const).map((letter, index) => (
              <span key={index} className="ld-join-logo-letter">
                {letter}
              </span>
            ))}
          </span>
        </p>

        <div className="ld-join-headline-wrap">
          <h1 className="ld-join-headline">
            Unleash your
            <br />
            creative spirit.
          </h1>
        </div>

        <div className="ld-join-body-wrap">
          <p className="ld-join-body">
            Are you or a friend an up and coming artist?
            <br />
            Sign up for our $1,000 per month grant program!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ld-join-form">
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
              placeholder="Enter your email"
              className="ld-join-input"
              aria-label="Email address"
            />
            <button type="submit" className="ld-join-cta">
              Get Started
            </button>
          </div>
          {error && (
            <p className="ld-join-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
