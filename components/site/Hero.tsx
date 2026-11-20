'use client';

import { useState } from 'react';
import { InteractiveTerminal } from './InteractiveTerminal';
import { SpotlightCard } from './SpotlightCard';
import { ResumeModal } from './ResumeModal';
import { CREDIBILITY_METRICS } from '@/src/data/experience';

/**
 * Hero — the first fold.
 *
 * Asymmetric 12-column grid (Phase 2 of the refactor spec):
 *
 *   Left (7 cols) — status pill, display H1, positioning copy and three
 *                   CTAs.
 *   Right (5 cols) — the InteractiveTerminal telemetry panel.
 *
 * Directly beneath, attached with `mt-10`, sits the credibility metric
 * bar: a single divided SpotlightCard with four columns. It is a
 * sibling of the grid rather than a separate section, so it reads as
 * part of the hero rather than as the top of a new module.
 *
 * The hero owns the resume modal's open state itself. The page is a
 * server component, so it cannot hand a callback down — the modal
 * lives with the button that opens it.
 */

type HeroProps = {
  /** The owner's name — used in the status line. */
  name?: string;
  /** The current role line. */
  role?: string;
  /** Where the owner is based. */
  location?: string;
};

export function Hero({
  name = 'Md Salekin Newaz',
  role = 'Senior Software QA Engineer',
  location = 'Dhaka, Bangladesh',
}: HeroProps) {
  const [showResume, setShowResume] = useState(false);
  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative pb-12 pt-24 lg:pt-28"
    >
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-6">
        {/* ─── Left column (7 cols) ─── */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Status pill */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--color-fg-2)]">
            <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            ISTQB® Certified · Available for QA Consulting &amp; Advisory
          </span>

          {/* Display heading */}
          <h1 className="text-[clamp(2.4rem,5.4vw,4.1rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-[var(--color-fg)]">
            Ship faster without{' '}
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
              breaking production.
            </span>
          </h1>

          {/* Role line */}
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {role}
          </p>

          {/* Positioning copy */}
          <p className="max-w-[46ch] text-[1.02rem] leading-relaxed text-[var(--color-fg-2)] sm:text-[1.08rem]">
            I build the quality infrastructure that lets engineering teams
            release with confidence — Playwright automation, AI-driven QA,
            API and load testing, and CI/CD integration for web, mobile
            and IoT products.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-[0.9rem] font-semibold text-white shadow-[0_10px_30px_-12px_var(--color-accent)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
            >
              Hire Me / QA Services <span aria-hidden="true">→</span>
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] px-5 py-2.5 text-[0.9rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              View Case Studies
            </a>
            <button
              type="button"
              onClick={() => setShowResume(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-[0.9rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <span aria-hidden="true">▤</span>
              Resume Preview
            </button>
          </div>

          {/* Status line */}
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <span className="text-[var(--color-fg-2)]">{name}</span>
            <span aria-hidden="true" className="text-[var(--color-fg-2)]/50">
              |
            </span>
            <span>{location}</span>
          </p>
        </div>

        {/* ─── Right column (5 cols) — telemetry ─── */}
        <div className="lg:col-span-5">
          <InteractiveTerminal />
        </div>
      </div>

      {/* ─── Credibility metric bar ─── */}
      <div className="mt-10">
        <SpotlightCard className="overflow-hidden">
          <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--color-border)] sm:grid-cols-4 sm:divide-y-0">
            {CREDIBILITY_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col gap-1 px-4 py-4 sm:px-5"
              >
                <dt className="font-mono text-2xl font-bold leading-none text-[var(--color-fg)]">
                  {metric.value}
                </dt>
                <dd className="flex flex-col gap-0.5">
                  <span className="text-[0.78rem] font-medium leading-tight text-[var(--color-fg-2)]">
                    {metric.label}
                  </span>
                  <span className="text-[0.68rem] leading-tight text-[var(--color-muted)]">
                    {metric.detail}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </SpotlightCard>
      </div>

      {showResume ? <ResumeModal onClose={() => setShowResume(false)} /> : null}
    </section>
  );
}
