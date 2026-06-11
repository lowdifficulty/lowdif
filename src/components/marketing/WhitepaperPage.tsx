import Link from "next/link";
import { ROADMAP, WHITEPAPER_SECTIONS } from "@/lib/marketing-content";

export function WhitepaperPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
      <Link
        href="/"
        className="mb-10 inline-block text-[10px] font-bold tracking-[0.2em] text-black/45 uppercase transition hover:text-black"
      >
        ← Home
      </Link>

      <p className="mb-4 text-[11px] tracking-[0.25em] text-black/40 uppercase">
        LOWDIF Token — Version 1.0 — 2025
      </p>
      <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl">
        Whitepaper
      </h1>

      <nav className="mt-12 border border-black/10 bg-black/[0.02] p-6">
        <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
          Contents
        </p>
        <ol className="space-y-2 text-sm text-black/65">
          {WHITEPAPER_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="transition hover:text-black"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-16 space-y-20">
        {WHITEPAPER_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="text-2xl font-black text-black">{section.title}</h2>

            {"paragraphs" in section &&
              section.paragraphs?.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="mt-4 text-sm leading-relaxed text-black/60"
                >
                  {p}
                </p>
              ))}

            {"intro" in section && section.intro && (
              <p className="mt-4 text-sm leading-relaxed text-black/60">
                {section.intro}
              </p>
            )}

            {"bullets" in section && section.bullets && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/60">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}

            {"closing" in section && section.closing && (
              <p className="mt-4 text-sm leading-relaxed text-black/60">
                {section.closing}
              </p>
            )}

            {"table" in section && section.table && (
              <div className="mt-6 divide-y divide-black/10 border border-black/10">
                {section.table.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:justify-between"
                  >
                    <span className="text-[10px] tracking-[0.2em] text-black/40 uppercase">
                      {label}
                    </span>
                    <span className="break-all text-sm font-bold text-black sm:text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {"steps" in section && section.steps && (
              <ol className="mt-6 space-y-6">
                {section.steps.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="text-lg font-black text-black/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-relaxed text-black/60">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {"phases" in section && section.phases && (
              <div className="mt-6 space-y-6">
                {ROADMAP.map((phase) => (
                  <div
                    key={phase.phase}
                    className="border border-black/10 bg-black/[0.02] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] tracking-[0.2em] text-black/40 uppercase">
                        {phase.phase}
                      </p>
                      <span className="text-[10px] font-bold tracking-[0.15em] text-black/50 uppercase">
                        {phase.status}
                      </span>
                    </div>
                    <h3 className="mt-2 font-black text-black">{phase.title}</h3>
                    <ul className="mt-3 space-y-1">
                      {phase.items.map((item) => (
                        <li key={item} className="text-sm text-black/55">
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-20 border border-black/10 bg-black/[0.02] p-8 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup" className="ld-btn-light-primary">
            Join the Movement
          </Link>
          <Link href="/signup" className="ld-btn-light-outline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
