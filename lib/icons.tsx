import type { ReactElement, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Focus-area icons.
 *
 * Tiny inline SVG components, one per focus area, used by both
 *   - `components/site/HeroOrbit.tsx` (the floating info cards around
 *     the hero photo) and
 *   - `components/site/FocusChip.tsx` (the icon-prefixed chip row on
 *     the left side of the hero).
 *
 * All icons share the same visual language: 24×24 viewBox, 1.6 stroke,
 * `currentColor` so the parent can tint them via `text-accent` /
 * `text-fg-2` etc. They are `aria-hidden` from the call site (every
 * consumer wraps them in a span that already labels the group).
 *
 * No icon library — this keeps the bundle small and lets each icon
 * pick up theme tokens directly.
 */

const BASE_PROPS: IconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function PlaywrightIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      {/* Theater masks — comedy (filled, on the left) and tragedy
          (outlined, on the right). Two ovals + small chin nubs. */}
      <path
        d="M8.2 11.2c-.9-.6-1.5-1.6-1.5-2.8 0-1.9 1.6-3.4 3.5-3.4s3.5 1.5 3.5 3.4c0 1.2-.6 2.2-1.5 2.8"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <ellipse
        cx="9.2"
        cy="8.4"
        rx="3.2"
        ry="3.6"
        transform="rotate(-12 9.2 8.4)"
      />
      <ellipse
        cx="15.2"
        cy="9.6"
        rx="2.8"
        ry="3.4"
        transform="rotate(14 15.2 9.6)"
      />
      <path d="M7.6 11.4c.6.9 1.4 1.6 2.4 1.6s1.8-.7 2.4-1.6" />
      <path d="M13.6 12.4c.5.7 1.1 1.2 1.9 1.2s1.4-.5 1.9-1.2" />
      <circle cx="8.1" cy="7.6" r="0.55" fill="currentColor" />
      <circle cx="14.5" cy="8.7" r="0.55" fill="currentColor" />
    </svg>
  );
}

export function ApiIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      {/* Angle brackets `</>`. */}
      <path d="M8.5 8 4.5 12l4 4" />
      <path d="M15.5 8 19.5 12l-4 4" />
      <path d="M13.5 6.5l-3 11" />
    </svg>
  );
}

export function AiIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      {/* Four-point sparkles ✨. */}
      <path d="M12 3.5l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" />
      <path d="M19 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
      <path d="M5 16.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
    </svg>
  );
}

export function CicdIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      {/* Cloud + circular arrow loop (CI/CD metaphor). */}
      <path d="M7.5 17.5h9a3.5 3.5 0 0 0 .9-6.9 4.5 4.5 0 0 0-8.6-.6 3.5 3.5 0 0 0-1.3 7.5z" />
      <path d="M10 21l1.2-1.2M10 21l1.2 1.2M10 21h4" />
      <path d="M16 14a4 4 0 0 1-1.6 7.7" />
    </svg>
  );
}

export type FocusIconId = 'playwright' | 'api' | 'ai' | 'cicd';

/**
 * Map a focus-area id to its icon component. Both `HeroOrbit` and
 * `FocusChip` use this to render the right glyph for a given key.
 */
export function focusIcon(id: FocusIconId): (props: IconProps) => ReactElement {
  switch (id) {
    case 'playwright':
      return PlaywrightIcon;
    case 'api':
      return ApiIcon;
    case 'ai':
      return AiIcon;
    case 'cicd':
      return CicdIcon;
  }
}
