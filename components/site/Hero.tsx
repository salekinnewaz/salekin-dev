'use client';

import { useState } from 'react';
import { ResumeModal } from './ResumeModal';
import { HeroIcon } from './HeroIcons';
import { CREDIBILITY_METRICS } from '@/src/data/experience';
import {
  HERO_CAPABILITY_CARDS,
  HERO_CORE_STACK,
  HERO_PIPELINE,
} from '@/src/data/hero';

/**
 * Hero — the first fold.
 *
 * Two-column composition:
 *
 *   Left (6 cols) — certification badge, display H1, positioning copy,
 *                   three CTAs and the owner status line.
 *   Right (6 cols) — the portrait stack: a circular portrait inside an
 *                   emerald/teal glow frame, four floating capability
 *                   cards orbiting it, and the QA Pipeline widget
 *                   beneath.
 *
 * Directly beneath, attached with `mt-10`, sits the credibility metric
 * bar (four columns) followed by the Core Stack badge row.
 *
 * The portrait is served from `/profile-image`, which reads the
 * admin-managed image out of the database. The `version` prop carries a
 * cache-busting token so a newly uploaded portrait appears without a
 * redeploy. `width`/`height` are set on the <img> so the browser reserves
 * the box before the bytes land — no layout shift.
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
  /**
   * The portrait to display. Defaults to the shipped asset at
   * `/images/profile.jpg` until an admin uploads a replacement.
   */
  profileImage?: {
    /** The public URL of the active portrait. */
    src: string;
    /** CSS `object-position` for the crop, e.g. "50% 30%". */
    position: string;
    /** Cache-busting token derived from the stored row's timestamp. */
    version: string;
  };
};

export function Hero({
  name = 'Md Salekin Newaz',
  role = 'Senior Software QA Engineer',
  location = 'Dhaka, Bangladesh',
  profileImage,
}: HeroProps) {
  const [showResume, setShowResume] = useState(false);

  const portraitSrc = profileImage
    ? `/profile-image?v=${profileImage.version}`
    : '/images/profile.jpg';
  const portraitPosition = profileImage?.position ?? '50% 30%';

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative overflow-x-clip pb-12 pt-24 lg:pt-28"
    >
      <div className="hero-grid grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6">
        {/* ─── Left column (6 cols) ─── */}
        <div className="flex flex-col gap-5 lg:col-span-6">
          {/* Certification badge */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--color-fg-2)]">
            <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            ISTQB® Certified · QA, Development &amp; Delivery
          </span>

          {/* Display heading */}
          <h1 className="text-[clamp(2.4rem,4.4vw,4.1rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-[var(--color-fg)]">
            Build, Test and Ship{' '}
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
              Reliable Software.
            </span>
          </h1>

          {/* Role line */}
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {role}
          </p>

          {/* Positioning copy */}
          <p className="max-w-[52ch] text-[1.02rem] leading-relaxed text-[var(--color-fg-2)] sm:text-[1.08rem]">
            Senior Software QA Engineer with development experience, focused
            on building quality, scalable, and user-friendly software across
            the full SDLC — from development and testing to release and
            ongoing support.
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

        {/* ─── Right column (6 cols) — portrait stack ─── */}
        <div className="lg:col-span-6">
          {/*
            The composition mirrors the reference artwork: a circular
            portrait with a neon glow ring at the centre, and four
            glass capability cards in the four corners. It is laid
            out as a grid so the cards never overlap the portrait and
            never escape the column — the composition scales as one
            unit with the viewport.
          */}
          <div className="hero-orbit">
            {/* Glow rings behind the portrait */}
            <div
              aria-hidden="true"
              className="hero-orbit-glow pointer-events-none absolute inset-0"
            />

            {/* Floating capability cards — corners of the composition */}
            {HERO_CAPABILITY_CARDS.map((card) => (
              <div
                key={card.id}
                className={`hero-float-card hero-float-${card.corner}`}
              >
                <span className="hero-float-icon">
                  <HeroIcon name={card.icon} />
                </span>
                <span className="hero-float-text">
                  <span className="hero-float-title">{card.title}</span>
                  <span className="hero-float-detail">{card.detail}</span>
                </span>
                <span aria-hidden="true" className="hero-float-bar" />
              </div>
            ))}

            {/* Portrait — centred in the composition */}
            <div className="hero-portrait">
              <div className="hero-portrait-frame absolute inset-0 rounded-full" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portraitSrc}
                alt={`${name} — profile portrait`}
                width={320}
                height={320}
                // Explicit width/height on the element plus the aspect
                // ratio wrapper means the box is reserved before the
                // bytes arrive, so the hero never shifts.
                className="relative h-full w-full rounded-full object-cover"
                style={{ objectPosition: portraitPosition }}
                // The portrait is decorative-adjacent: the alt text
                // already names the owner, and the shape is decorative.
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>

          {/* ─── QA Pipeline widget ─── */}
          <div className="hero-pipeline mt-8">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                QA Pipeline
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                Live
              </span>
            </div>
            <ol className="mt-3 grid grid-cols-4 gap-1.5">
              {HERO_PIPELINE.map((stage, i) => (
                <li key={stage.id} className="relative flex flex-col gap-1.5">
                  {/* Connector */}
                  {i < HERO_PIPELINE.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[calc(50%+14px)] right-[calc(-50%+14px)] top-[9px] h-px bg-[var(--color-border-strong)]"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={`hero-pipeline-dot hero-pipeline-${stage.state}`}
                  />
                  <span className="text-[0.72rem] font-medium leading-tight text-[var(--color-fg)]">
                    {stage.label}
                  </span>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] leading-tight text-[var(--color-muted)]">
                    {stage.detail}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ─── Credibility metric bar ─── */}
      <div className="mt-10">
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
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
        </div>
      </div>

      {/* ─── Core Stack ─── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Core Stack
        </span>
        <ul className="flex flex-wrap items-center gap-1.5">
          {HERO_CORE_STACK.map((tech) => (
            <li key={tech}>
              <span className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] px-2.5 py-1 font-mono text-[0.68rem] text-[var(--color-fg-2)]">
                {tech}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {showResume ? <ResumeModal onClose={() => setShowResume(false)} /> : null}
    </section>
  );
}
