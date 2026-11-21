import type { ReactNode } from 'react';
import type { HeroCardIcon } from '@/src/data/hero';

/**
 * Hero capability-card icons.
 *
 * A tiny hand-authored SVG set — same visual language as
 * `ServicesIcons.tsx` (24×24 grid, 1.75 stroke, `currentColor`) so the
 * hero cards and the Services capability cards read as one family.
 *
 * No icon library: these four glyphs are all the hero needs, and
 * inlining them keeps the bundle free of an extra dependency.
 */

const PATHS: Record<HeroCardIcon, ReactNode> = {
  // Playwright — the two theatre masks.
  playwright: (
    <>
      <path d="M3.5 4.2h7.2v6.4a3.6 3.6 0 0 1-7.2 0V4.2Z" />
      <path d="M5.4 6.9h1.3M7.9 6.9h1.3M5.9 9.2c1.1.8 2.4.8 3.5 0" />
      <path d="M13.3 4.2h7.2v6.4a3.6 3.6 0 0 1-7.2 0V4.2Z" />
      <path d="M15.2 6.9h1.3M17.7 6.9h1.3M15.7 9.2c1.1.8 2.4.8 3.5 0" />
    </>
  ),
  // Layers — three stacked plates.
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  // Sparkles — the AI glyph: one large four-point star, one small.
  sparkles: (
    <>
      <path d="M9.5 3.5 11 7.6l4.1 1.5L11 10.6 9.5 14.7 8 10.6 3.9 9.1 8 7.6 9.5 3.5Z" />
      <path d="M17 12.4 17.9 15l2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
    </>
  ),
  // Git branch — a fork: two nodes joined by a branching line.
  'git-branch': (
    <>
      <circle cx="6.5" cy="5.5" r="2.2" />
      <circle cx="6.5" cy="18.5" r="2.2" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M6.5 7.7v8.6" />
      <path d="M17 11.2v1.3a3.5 3.5 0 0 1-3.5 3.5H8.7" />
    </>
  ),
};

export function HeroIcon({
  name,
  className = '',
}: {
  name: HeroCardIcon;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      width="100%"
      height="100%"
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * Metric-bar icons — briefcase, globe, rocket, code. The metric bar
 * reads as four columns in the reference, each with an icon to the left
 * of its number.
 */
export type MetricIcon = 'briefcase' | 'globe' | 'rocket' | 'code';

const METRIC_PATHS: Record<MetricIcon, ReactNode> = {
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.2" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4c2.2 2.4 3.4 5.4 3.4 8.6s-1.2 6.2-3.4 8.6c-2.2-2.4-3.4-5.4-3.4-8.6S9.8 5.8 12 3.4Z" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 2.2 4.8 5.6 4.8 9.4l-2.2 3.2H9.4l-2.2-3.2C7.2 8.6 9 5.2 12 3Z" />
      <circle cx="12" cy="10.2" r="1.9" />
      <path d="M9.4 15.6 7 20.4l3.5-1.4M14.6 15.6l2.4 4.8-3.5-1.4" />
    </>
  ),
  code: (
    <>
      <path d="M9 7.5 4 12l5 4.5" />
      <path d="M15 7.5 20 12l-5 4.5" />
    </>
  ),
};

export function MetricIconGlyph({
  name,
  className = '',
}: {
  name: MetricIcon;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      width="100%"
      height="100%"
    >
      {METRIC_PATHS[name]}
    </svg>
  );
}
