'use client';

import { useState } from 'react';
import { SectionHeader } from './SectionHeader';
import { SpotlightCard } from './SpotlightCard';
import {
  FEATURED_REVIEWS,
  ADDITIONAL_REVIEWS,
  LINKEDIN_PROFILE_URL,
  initialsFor,
  type Review,
} from '@/src/data/reviews';

/**
 * ReviewsSection — module 05.
 *
 * Three featured LinkedIn endorsements in an equal-height grid, with
 * two more revealed by a "+ Show 2 more endorsements" toggle. Every
 * quote is verbatim from the public LinkedIn recommendations.
 */

function ReviewCard({ review }: { review: Review }) {
  return (
    <SpotlightCard className="flex h-full flex-col p-5">
      <span
        aria-hidden="true"
        className="font-mono text-2xl leading-none text-[var(--color-accent)]"
      >
        &ldquo;
      </span>
      <blockquote className="mt-1 flex-1 text-[0.85rem] leading-relaxed text-[var(--color-fg-2)]">
        {review.quote}
      </blockquote>
      <footer className="bento-footer mt-4 flex items-center gap-2.5 pt-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-mono text-[0.68rem] font-bold text-[var(--color-accent)]"
        >
          {initialsFor(review.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.8rem] font-semibold leading-tight text-[var(--color-fg)]">
            {review.name}
          </span>
          <span className="mt-0.5 block truncate text-[0.68rem] leading-tight text-[var(--color-muted)]">
            {review.role} · {review.company}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[0.6rem] text-[var(--color-muted)]">
          {review.date.replace(', 2025', '').replace(', 2023', '')}
        </span>
      </footer>
    </SpotlightCard>
  );
}

export function ReviewsSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section
      id="reviews"
      tabIndex={-1}
      className="section-anchor relative py-14 lg:py-16"
    >
        <SectionHeader
          index="05"
          name="Endorsements"
          title="What colleagues and clients say"
          description="Verbatim LinkedIn recommendations from the people I worked with on those projects."
          actions={
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              View on LinkedIn <span aria-hidden="true">↗</span>
            </a>
          }
        />

        {/* ─── Featured grid — 3 columns, equal height ─── */}
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* ─── Additional endorsements ─── */}
        {showAll ? (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {ADDITIONAL_REVIEWS.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : null}

        {/* ─── Toggle ─── */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-[0.82rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {showAll
              ? 'Show fewer endorsements'
              : `+ Show ${ADDITIONAL_REVIEWS.length} more endorsements`}
            <span
              aria-hidden="true"
              className={`transition-transform duration-200 ${
                showAll ? 'rotate-90' : ''
              }`}
            >
              →
            </span>
          </button>
        </div>
    </section>
  );
}
