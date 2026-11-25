'use client';

/**
 * ServicesIcons — the inline SVG icon set for the Services module.
 *
 * These are hand-authored 24×24 stroke icons rather than glyphs from a
 * font, so they render crisply at any size, inherit `currentColor`, and
 * stay consistent across platforms (no emoji fallback).
 */

export type ServiceIconName =
  | 'layers'
  | 'code'
  | 'chip'
  | 'database'
  | 'rocket'
  | 'stack'
  | 'target'
  | 'layers-2'
  | 'bolt'
  | 'box'
  | 'headset'
  | 'compass'
  | 'code-2'
  | 'rocket-2'
  | 'person'
  | 'users'
  | 'board'
  | 'support';

type IconProps = {
  name: ServiceIconName;
  className?: string;
};

/**
 * The path data for each icon. All icons are drawn on a 24×24 grid with
 * a 1.75 stroke width so they sit on the same optical weight.
 */
const PATHS: Record<ServiceIconName, React.ReactNode> = {
  layers: (
    <>
      <path d="M12 2.75 2.75 7.5 12 12.25l9.25-4.75L12 2.75Z" />
      <path d="m2.75 12 9.25 4.75L21.25 12" />
      <path d="m2.75 16.5 9.25 4.75 9.25-4.75" />
    </>
  ),
  code: (
    <>
      <path d="m8.5 8-4 4 4 4" />
      <path d="m15.5 8 4 4-4 4" />
      <path d="m13.5 5-3 14" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3.5v3.5M14 3.5v3.5M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6" />
      <path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.5c3 2.2 4.75 5.6 4.75 9.25L15 15.5H9l-1.75-3.75C7.25 8.1 9 4.7 12 2.5Z" />
      <circle cx="12" cy="9" r="1.75" />
      <path d="M9 15.5c-1.2 1.5-1.5 3.5-1.5 5.5 2-1 3.5-2 4.5-3.5" />
      <path d="M15 15.5c1.2 1.5 1.5 3.5 1.5 5.5-2-1-3.5-2-4.5-3.5" />
    </>
  ),
  stack: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.75" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.75" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.75" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.75" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  'layers-2': (
    <>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="m3 12.5 9 4.5 9-4.5" />
      <path d="m3 17 9 4.5 9-4.5" />
    </>
  ),
  bolt: <path d="M13.5 2.5 4.5 13.5H11l-.5 8L19.5 10.5H13l.5-8Z" />,
  box: (
    <>
      <path d="M20.5 7.5 12 3 3.5 7.5v9L12 21l8.5-4.5v-9Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5ZM20 13h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-5Z" />
      <path d="M18 19v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.5 4.5L9 15l1.5-4.5L15 9Z" />
    </>
  ),
  'code-2': (
    <>
      <path d="m8.5 8-4 4 4 4" />
      <path d="m15.5 8 4 4-4 4" />
      <path d="m13.5 5-3 14" />
    </>
  ),
  'rocket-2': (
    <>
      <path d="M12 2.5c3 2.2 4.75 5.6 4.75 9.25L15 15.5H9l-1.75-3.75C7.25 8.1 9 4.7 12 2.5Z" />
      <circle cx="12" cy="9" r="1.75" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.5" />
      <path d="M3 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.5M17.5 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
      <path d="m9 11 2 2 4-4" />
    </>
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5M12 16.2h.01" />
    </>
  ),
};

export function ServiceIcon({ name, className = '' }: IconProps) {
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
      className={className}
      width="100%"
      height="100%"
    >
      {PATHS[name]}
    </svg>
  );
}
