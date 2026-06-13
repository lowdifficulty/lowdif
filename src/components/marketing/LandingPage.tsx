import Link from "next/link";
import {
  CONTRACT_ADDRESS,
  FEATURES,
  HERO_STATS,
  HOW_IT_WORKS,
  ROADMAP,
  TOKENOMICS_ROWS,
} from "@/lib/marketing-content";
import { appHref } from "@/lib/site-urls";
import { FaqSection } from "./FaqSection";

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-12 max-w-2xl">
      <p className="ld-eyebrow mb-3 text-white/40">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function CtaButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <Link href="/signup" className="ld-btn-primary">
        Join the Movement
      </Link>
      <Link href="/whitepaper" className="ld-btn-outline">
        Read Whitepaper
      </Link>
    </div>
  );
}

export function LandingPage() {
  return (
    <>
      <section className="relative flex min-h-[90vh] flex-col justify-center border-b border-white/10 px-6 pt-24 pb-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="ld-eyebrow mb-6 text-white/50">Proof of Listen</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl">
            Music is the
            <br />
            Mining Rig
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            The first cryptocurrency mined by listening. Every completed play
            earns LOWDIF split equally between the listener and the artist. No
            hardware. No energy waste. Just music.
          </p>
          <CtaButtons className="mt-10" />

          <div className="mt-16 grid grid-cols-3 gap-6 border border-white/10 sm:max-w-xl">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center sm:px-6">
                <p className="text-2xl font-black text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 border-b border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="Why LOWDIF" title="Built Different" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.num}
                className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20"
              >
                <p className="text-[10px] tracking-[0.3em] text-white/30">
                  {feature.num}
                </p>
                <h3 className="mt-4 text-lg font-black text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-b border-white/10 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="The Mechanism" title="How Mining Works" />
          <div className="grid gap-8 sm:grid-cols-2">
            {HOW_IT_WORKS.map((step) => (
              <article key={step.num} className="flex gap-5">
                <p className="text-3xl font-black text-white/15">{step.num}</p>
                <div>
                  <h3 className="text-lg font-black text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href={appHref("/trending")}
              className="ld-btn-outline text-[10px]"
            >
              Start Listening
            </Link>
          </div>
        </div>
      </section>

      <section
        id="tokenomics"
        className="scroll-mt-24 border-b border-white/10 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="Token Economics" title="The Numbers" />
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="divide-y divide-white/10 border border-white/10">
              {TOKENOMICS_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
                    {row.label}
                  </span>
                  <span className="break-all text-sm font-bold text-white sm:text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center border border-white/10 p-8">
              <p className="ld-eyebrow mb-4 text-white/40">Supply Model</p>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-white">
                    <span>Listener Rewards</span>
                    <span>50%</span>
                  </div>
                  <div className="h-2 bg-white/10">
                    <div className="h-full w-1/2 bg-white" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-white">
                    <span>Artist Rewards</span>
                    <span>50%</span>
                  </div>
                  <div className="h-2 bg-white/10">
                    <div className="h-full w-1/2 bg-white/70" />
                  </div>
                </div>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-white/55">
                Every token minted is split equally. No allocation exists outside
                of earning. Supply grows with listens. Supply shrinks with ad
                spend.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="scroll-mt-24 border-b border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="The Plan" title="Roadmap" />
          <div className="grid gap-6 lg:grid-cols-2">
            {ROADMAP.map((phase) => (
              <article
                key={phase.phase}
                className="border border-white/10 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] tracking-[0.25em] text-white/40 uppercase">
                    {phase.phase}
                  </p>
                  <span
                    className={`text-[10px] font-bold tracking-[0.15em] uppercase ${
                      phase.status === "Complete"
                        ? "text-white"
                        : phase.status === "In Progress"
                          ? "text-white/70"
                          : "text-white/35"
                    }`}
                  >
                    {phase.status}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black text-white">
                  {phase.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm text-white/55 before:content-['·']"
                    >
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-b border-white/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeader eyebrow="Questions" title="FAQ" />
          <FaqSection />
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ld-eyebrow mb-4 text-white/40">The canvas is ready</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Be the First to Mine
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            No hardware. No energy waste. No pre-mine. Just music. Join the
            movement and be among the first listeners and artists when the
            platform opens.
          </p>
          <CtaButtons className="mt-10 justify-center" />
          <p className="mt-8 font-mono text-[10px] text-white/30">
            {CONTRACT_ADDRESS}
          </p>
        </div>
      </section>
    </>
  );
}
