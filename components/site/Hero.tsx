'use client';

import { useState } from 'react';
import { ResumeModal } from './ResumeModal';
import { HeroIcon, MetricIconGlyph } from './HeroIcons';
import { StackTechIcon } from './StackIcons';
import { CREDIBILITY_METRICS } from '@/src/data/experience';
import {
  HERO_CAPABILITY_CARDS,
  HERO_CORE_STACK,
  HERO_PIPELINE,
} from '@/src/data/hero';
import { DEFAULT_PROFILE_IMAGE, type ProfileImageMode } from '@/lib/constants';

/**
 * Hero — the first fold.
 *
 * Two-column composition:
 *
 *   Left (6 cols) — certification badge, display H1, role label,
 *                   positioning copy, three CTAs in a single row and the
 *                   owner status line.
 *   Right (6 cols) — the portrait stage: a large portrait standing on
 *                   a tilted emerald frame, a vertical stack of four
 *                   capability cards to the portrait's left, and the QA
 *                   Pipeline card floating over the portrait's
 *                   lower-right.
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
   * the shipped cut-out until an admin uploads a replacement.
   */
  profileImage?: {
    /** CSS `object-position` for the crop, e.g. "50% 30%". */
    position: string;
    /** Cache-busting token derived from the stored row's timestamp. */
    version: string;
    /**
     * How the portrait is rendered.
     *
     * `cutout` (the default) letterboxes the image into the stage, so
     * a subject with an alpha channel stands on the tilted frame.
     * `photo` fills the tilted frame with an opaque image instead.
     */
    mode?: ProfileImageMode;
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
    : DEFAULT_PROFILE_IMAGE;
  const portraitPosition = profileImage?.position ?? '50% 30%';
  const portraitMode: ProfileImageMode = profileImage?.mode ?? 'cutout';
  const isPhotoMode = portraitMode === 'photo';

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative overflow-x-clip pb-12 pt-24 lg:pt-28"
    >
      <div className="hero-grid grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6">
        {/* ─── Left column ─── */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Certification badge */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--color-fg-2)]">
            <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            ISTQB® Certified · QA, Development &amp; Delivery
          </span>

          {/* Display heading */}
          {/*
            The headline breaks after "Ship" on every viewport that can
            fit it, matching the reference's two-line stack. Below the
            point where the first line no longer fits on its own, the
            break is released and the text reflows naturally.
          */}
          <h1 className="text-[clamp(2.1rem,3.2vw,3.3rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[var(--color-fg)]">
            <span className="hero-line">
              Build, Test and Ship
            </span>{' '}
            <span className="hero-line hero-line-accent bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
              Reliable Software.
            </span>
          </h1>

          {/*
            The hand-drawn swoosh that underlines the headline in the
            reference. It is an SVG rather than a border so the stroke
            can taper at both ends the way a marker stroke does.
          */}
          <svg
            aria-hidden="true"
            viewBox="0 0 340 26"
            fill="none"
            preserveAspectRatio="none"
            className="hero-headline-underline"
          >
            <path
              d="M4 19C46 8 118 3 196 5c46 1.2 104 5.4 140 12"
              stroke="var(--color-accent)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M18 22c44-8 108-12 176-11 40 .6 88 3 122 8"
              stroke="var(--color-accent-2)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          {/* Role line */}
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {role}
          </p>

          {/* Positioning copy */}
          <p className="max-w-[62ch] text-[0.94rem] leading-relaxed text-[var(--color-fg-2)] sm:text-[0.97rem]">
            Senior Software QA Engineer with development experience, focused
            on building quality, scalable, and user-friendly software across
            the full SDLC — from development and testing to release and
            ongoing support.
          </p>

          {/* CTAs — all three in a single row on desktop */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2.5 text-[0.85rem] font-semibold text-white shadow-[0_10px_30px_-12px_var(--color-accent)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
            >
              Hire Me / QA Services <span aria-hidden="true">→</span>
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] px-4 py-2.5 text-[0.85rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              View Case Studies
            </a>
            <button
              type="button"
              onClick={() => setShowResume(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-[0.85rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
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

        {/* ─── Right column — portrait stage ─── */}
        <div className="lg:col-span-7">
          <div className="hero-stage">
            {/* Ambient illumination behind the whole stage */}
            <div
              aria-hidden="true"
              className="hero-stage-glow pointer-events-none absolute inset-0"
            />

            {/*
              The capability cards stack vertically to the LEFT of the
              portrait. They are a sibling of the portrait stage rather
              than children of it, so the portrait can be sized and
              positioned independently of the card column.
            */}
            <ul className="hero-cap-stack">
              {HERO_CAPABILITY_CARDS.map((card) => (
                <li key={card.id} className="hero-cap-card">
                  <span className="hero-cap-icon">
                    <HeroIcon name={card.icon} />
                  </span>
                  <span className="hero-cap-text">
                    <span className="hero-cap-title">{card.title}</span>
                    <span className="hero-cap-detail">{card.detail}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* ─── Portrait stage ─── */}
            <div className="hero-portrait-stage">
              {/* The tilted rounded-rectangle the portrait stands on */}
              <div
                aria-hidden="true"
                className="hero-portrait-frame pointer-events-none absolute inset-0"
              />

              {/*
                The photo itself.

                The default portrait is a cut-out PNG — the studio
                backdrop is removed at build time (see
                `scripts/cutout-portrait.swift`) so the subject reads as
                a cut-out standing on the tilted frame, the way the
                reference does.

                An admin-uploaded image is rendered the same way, so
                swapping the portrait never changes the composition: the
                frame, the card column and the QA Pipeline are all
                sized independently of the photo.

                An *opaque* upload is different: there is nothing to
                "stand on" the frame, so it is clipped to the frame's
                tilted rounded rectangle and fills it. That branch is
                entirely separate markup, so the cut-out's DOM — and
                therefore its rendering — is untouched.
              */}
              <div className="hero-portrait" data-mode={portraitMode}>
                {isPhotoMode ? (
                  <div className="hero-portrait-photo-clip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={portraitSrc}
                      alt={`${name} — profile portrait`}
                      width={400}
                      height={400}
                      className="relative h-full w-full object-cover"
                      style={{ objectPosition: portraitPosition }}
                      fetchPriority="high"
                      decoding="async"
                    />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={portraitSrc}
                    alt={`${name} — profile portrait`}
                    width={400}
                    height={400}
                    className="relative h-full w-full object-contain object-bottom"
                    style={{ objectPosition: portraitPosition }}
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
              </div>
            </div>

            {/* ─── QA Pipeline — floating over the portrait's lower right ─── */}
            <div className="hero-pipeline">
              {/* Browser chrome: traffic lights on the left, title and
                  status pill on the right. */}
              <div className="hero-pipeline-bar">
                <span aria-hidden="true" className="hero-pipeline-dots">
                  <i className="hero-pipeline-dot-red" />
                  <i className="hero-pipeline-dot-yellow" />
                  <i className="hero-pipeline-dot-green" />
                </span>
                <span className="font-mono text-[0.68rem] font-semibold tracking-[-0.01em] text-[var(--color-fg)]">
                  QA Pipeline
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-2 py-0.5 font-mono text-[0.58rem] font-semibold tracking-[0.02em] text-[var(--color-on-accent)] shadow-[0_0_14px_-4px_var(--color-accent)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="9"
                    height="9"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5 10 17.5 19 7" />
                  </svg>
                  Passed
                </span>
              </div>

              <ol className="hero-pipeline-track">
                {HERO_PIPELINE.map((stage, i) => (
                  <li key={stage.id} className="relative flex flex-col gap-1.5">
                    {/* Connector */}
                    {i < HERO_PIPELINE.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="hero-pipeline-line absolute left-[calc(50%+9px)] right-[calc(-50%+9px)] top-[9px] h-px"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="hero-pipeline-check"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="100%"
                        height="100%"
                      >
                        <path d="M5 12.5 10 17.5 19 7" />
                      </svg>
                    </span>
                    <span className="text-[0.7rem] font-medium leading-tight text-[var(--color-fg-2)]">
                      {stage.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
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
                className="flex items-start gap-3 px-4 py-4 sm:px-5"
              >
                <span className="hero-metric-icon">
                  <MetricIconGlyph name={metric.icon} />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
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
            <li key={tech.name}>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] py-1 pl-1.5 pr-2.5 font-mono text-[0.68rem] text-[var(--color-fg-2)]">
                <span className="hero-stack-icon">
                  <StackTechIcon name={tech.icon} />
                </span>
                {tech.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {showResume ? <ResumeModal onClose={() => setShowResume(false)} /> : null}
    </section>
  );
}
