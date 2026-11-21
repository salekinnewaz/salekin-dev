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
  // Code — a `</>` angle-bracket pair.
  code: (
    <>
      <path d="M9 8 5 12l4 4" />
      <path d="M15 8l4 4-4 4" />
    </>
  ),
  // Layers — three stacked plates.
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  // Chip — an AI/accelerator die with pins.
  chip: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <path d="M10 3.5V6M14 3.5V6M10 18v2.5M14 18v2.5M3.5 10H6M3.5 14H6M18 10h2.5M18 14h2.5" />
    </>
  ),
  // Database — API/performance stack.
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
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
      strokeWidth={1.75}
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
