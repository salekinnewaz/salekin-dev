'use client';

import { useState } from 'react';
import {
  LINKEDIN_PROFILE_URL,
  initialsFor,
  type Recommendation,
} from '@/lib/site/recommendations';

type Props = {
  initial: Recommendation[];
  extra: Recommendation[];
};

/**
 * Client island for the "View more recommendations" disclosure.
 *
 * The first `initial.length` cards are always rendered (server-side
 * in the parent). If there are `extra` cards beyond that, this widget
 * renders a "+ View 2 more recommendations" button that reveals the
 * remaining cards in place. Reveals are non-destructive — the button
 * toggles back to "Hide" so the visitor can collapse.
 *
 * We use the native `<details>` element so the disclosure is
 * keyboard-operable and announced correctly by screen readers (the
 * surrounding <button> uses `aria-expanded` + `aria-controls` for
 * fine-grained labelling).
 */
export function RecommendationsViewMore({ initial, extra }: Props) {
  const [open, setOpen] = useState(false);
  if (extra.length === 0) return null;

  return (
    <div className="reveal mt-8 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="recommendations-extras"
        className="btn-outline magnetic"
      >
        {open
          ? 'Hide extra recommendations'
          : `+ View ${extra.length} more recommendation${extra.length === 1 ? '' : 's'}`}
        <span aria-hidden="true" className="ml-1">
          {open ? '↑' : '↓'}
        </span>
      </button>

      {/* All extra cards are mounted (not conditionally rendered) so
          CSS-driven reveal/stagger animations fire on first show even
          if the user toggles back and forth. `hidden` keeps them out
          of the layout + the a11y tree until expanded. */}
      <div
        id="recommendations-extras"
        className="w-full"
        hidden={!open}
        inert={!open}
      >
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 reveal-stagger"
        >
          {extra.map((r) => (
            <li key={r.id} className="h-full">
              <ExtraCard recommendation={r} />
            </li>
          ))}
        </ul>
      </div>

      <a
        href={LINKEDIN_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-accent"
        aria-label="Read all recommendations on LinkedIn (opens in a new tab)"
      >
        Read all on LinkedIn <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/**
 * Slightly trimmed version of the main `RecommendationCard` — avoids
 * the date/role-overflow corner chips so the second row of cards is
 * visually a touch quieter than the highlighted initial trio.
 */
function ExtraCard({ recommendation: r }: { recommendation: Recommendation }) {
  const initials = initialsFor(r.name);
  return (
    <figure className="glass-card glass-card-hover relative flex h-full flex-col gap-4 p-6 sm:p-7">
      <span
        aria-hidden="true"
        className="select-none font-display text-5xl leading-none text-accent"
      >
        &ldquo;
      </span>
      <blockquote className="flex-1 text-sm leading-relaxed text-fg-2 text-pretty sm:text-base">
        {r.quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent ring-1 ring-inset ring-accent/30"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{r.name}</p>
          <p className="truncate text-xs text-muted">
            {r.role}
            <span aria-hidden="true"> · </span>
            {r.company}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
