import type { ReactNode } from 'react';
import type { StackIcon as StackIconName } from '@/src/data/hero';

/**
 * Core Stack technology icons.
 *
 * Hand-authored SVG marks — no icon library, so the bundle stays free
 * of an extra dependency. Unlike the capability-card glyphs, these are
 * *filled* brand-style marks: the reference shows each technology in
 * its own recognisable form and colour (the blue TypeScript square, the
 * yellow JavaScript square, the red Angular shield, and so on), so
 * each glyph carries its own colours rather than inheriting
 * `currentColor`.
 *
 * Every mark is drawn on the same 24×24 grid so the badges in the row
 * share one optical weight.
 */

/**
 * A mark that is a solid colour shape. `body` is the filled path, and
 * `detail` is the knocked-out (white) detail drawn on top of it.
 */
function solidMark(
  body: ReactNode,
  detail: ReactNode,
  detailFill = '#ffffff',
): ReactNode {
  return (
    <>
      <g fill="currentColor">{body}</g>
      <g fill={detailFill}>{detail}</g>
    </>
  );
}

const PATHS: Record<StackIconName, ReactNode> = {
  // Playwright — the two theatre masks, red and green.
  playwright: (
    <>
      <path
        fill="#E75A5A"
        d="M2.6 4.4h8v6.6a4 4 0 0 1-8 0V4.4Z"
      />
      <path
        fill="#5AB552"
        d="M13.4 4.4h8v6.6a4 4 0 0 1-8 0V4.4Z"
      />
      {/* Eyes and smiles, knocked out in each mask's own colour. */}
      <g fill="#fff">
        <circle cx="5.1" cy="7.6" r="1.05" />
        <circle cx="8.2" cy="7.6" r="1.05" />
        <circle cx="15.9" cy="7.6" r="1.05" />
        <circle cx="19" cy="7.6" r="1.05" />
      </g>
      <path
        d="M4.4 9.9c1.5 1.3 3.6 1.3 5.1 0"
        fill="none"
        stroke="#E75A5A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15.2 9.9c1.5 1.3 3.6 1.3 5.1 0"
        fill="none"
        stroke="#5AB552"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
  // TypeScript — the blue square with a white "TS".
  typescript: solidMark(
    <path d="M2 2h20v20H2z" fill="#3178C6" />,
    <>
      <path d="M5.6 9.6h5.1v1.9H9.2v6.1H7.1v-6.1H5.6V9.6Z" />
      <path d="M18.9 10.9c-.5-.4-1.3-.6-2.1-.6-1.2 0-2 .6-2 1.5 0 .9.7 1.2 2 1.6 1.6.5 2.6 1 2.6 2.4 0 1.5-1.2 2.4-3 2.4-1 0-1.9-.2-2.6-.7l.9-1.6c.6.4 1.2.6 1.8.6.7 0 1.1-.3 1.1-.8 0-.5-.4-.7-1.6-1.1-1.7-.5-2.9-1.1-2.9-2.6 0-1.4 1.1-2.5 3-2.5 1.1 0 2 .2 2.6.7l-.8 1.5Z" />
    </>,
  ),
  // JavaScript — the yellow square with a dark "JS".
  javascript: solidMark(
    <path d="M2 2h20v20H2z" fill="#F7DF1E" />,
    <path
      d="M11.3 10.2c-.3-.2-.7-.3-1.1-.3-.7 0-1.1.3-1.1.8 0 .5.4.6 1.1.8.9.3 1.4.6 1.4 1.4 0 .8-.6 1.3-1.6 1.3-.6 0-1.1-.2-1.5-.5l.5-.9c.3.2.7.4 1 .4.4 0 .6-.2.6-.4 0-.3-.2-.4-.9-.6-.9-.3-1.6-.6-1.6-1.4 0-.8.7-1.4 1.7-1.4.5 0 1 .1 1.4.4l-.5.8Zm4.2 3.9c.3.2.6.3 1 .3.5 0 .8-.2.8-.6 0-.3-.2-.5-1-.9-1-.4-1.5-.7-1.5-1.5 0-.9.7-1.5 1.8-1.5.5 0 1 .1 1.4.4l-.5.9c-.3-.2-.6-.3-.9-.3-.4 0-.6.2-.6.5 0 .3.3.4 1 .8 1 .4 1.5.7 1.5 1.6 0 .9-.7 1.5-1.8 1.5-.6 0-1.2-.2-1.6-.5l.4-.6Z"
      fill="#111"
    />,
  ),
  // Angular — the red shield with a white "A".
  angular: solidMark(
    <path d="M12 1.8 3.4 4.6v6.1c0 5.4 3.6 10.4 8.6 11.7 5-1.3 8.6-6.3 8.6-11.7V4.6L12 1.8Z" fill="#DD0031" />,
    <path
      d="M12 5.8 6.4 17h2.6l1.1-2.6h3.8L15 17h2.6L12 5.8Zm-.9 3.3 1.4 3.2h-2.8l1.4-3.2Z"
      fill="#fff"
    />,
  ),
  // GitHub Actions — the black circle with the white Octocat silhouette.
  'github-actions': (
    <>
      <circle cx="12" cy="12" r="10" fill="#181717" />
      <path
        fill="#fff"
        d="M12 4.6a7.4 7.4 0 0 0-2.3 14.4c.4.1.5-.2.5-.4v-1.5c-1.9.4-2.4-.9-2.4-.9-.3-.8-.8-1-.8-1-.6-.4 0-.4 0-.4.7 0 1 .7 1 .7.6 1 1.6.7 2 .6 0-.4.2-.7.4-.9-1.6-.2-3.2-.8-3.2-3.5 0-.8.3-1.4.7-1.9-.1-.2-.3-.9.1-1.9 0 0 .6-.2 1.9.7.6-.2 1.2-.2 1.7 0 1.3-.9 1.9-.7 1.9-.7.4 1 .2 1.7.1 1.9.5.5.7 1.1.7 1.9 0 2.7-1.6 3.3-3.2 3.5.2.2.5.6.5 1.3v2c0 .2.1.5.5.4A7.4 7.4 0 0 0 12 4.6Z"
      />
    </>
  ),
  // Docker — the blue whale carrying containers.
  docker: (
    <>
      {/* Container blocks */}
      <g fill="#2496ED">
        <rect x="3" y="11.2" width="3.6" height="3.6" rx="0.5" />
        <rect x="7.4" y="11.2" width="3.6" height="3.6" rx="0.5" />
        <rect x="11.8" y="11.2" width="3.6" height="3.6" rx="0.5" />
        <rect x="7.4" y="6.9" width="3.6" height="3.6" rx="0.5" />
        <rect x="11.8" y="6.9" width="3.6" height="3.6" rx="0.5" />
      </g>
      {/* The whale */}
      <path
        fill="#2496ED"
        d="M1.6 15.4h16.8c2.2 0 3.3-1.4 4-3.2.5-1.3.4-2.6-.2-3.6-.5.9-1.3 1.4-2.4 1.5-.2-2-1.3-3.6-3-4.5.1 1.1-.2 2-1 2.8-.3-.5-.8-1-1.5-1.4.2 2.6-1.6 4.4-4.4 4.9H1.6v3.5Z"
      />
      {/* Wave under the whale */}
      <path
        d="M1.6 17.6c2.6 1.4 5.3 2.1 8 2.1 3.4 0 6.6-1.1 9.3-3"
        fill="none"
        stroke="#2496ED"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </>
  ),
  // AWS — the orange "aws" wordmark with the smile arrow.
  aws: (
    <>
      <g fill="#FF9900">
        <path d="M4.1 6.9h1.6l1.5 4.9 1.4-4.9h1.2l1.4 4.9 1.5-4.9h1.6l-2.4 8h-1.6l-1.3-4.5-1.3 4.5H6.4L4.1 6.9Z" />
        <path d="M14.6 10.9c0-.7.5-1 1.2-1 .8 0 1.2.4 1.2 1v2.9h-1.2v-.7c-.3.5-.8.8-1.4.8-.9 0-1.5-.7-1.5-1.7 0-1.1.7-1.7 1.8-1.7.6 0 1.1.3 1.3.7v-.2c0-.4-.2-.6-.6-.6-.4 0-.6.2-.6.6h-1.2Zm2.4 1.3c-.4 0-.6.2-.6.6s.3.6.7.6c.5 0 .8-.3.8-.8v-.4h-.9Z" />
        <path d="M19.9 11.2c1.5 0 2.6 1 2.6 2.4v.7h-3.8c0 .6.4 1 1 1 .5 0 .8-.2 1-.5l.9.5c-.4.7-1.1 1.1-2 1.1-1.3 0-2.2-.9-2.2-2.3 0-1.4.9-2.3 2.2-2.3Zm-1.2 1.9h2.4c0-.6-.4-1-1.2-1s-1.2.4-1.2 1Z" />
      </g>
      {/* The smile */}
      <path
        d="M4.5 16.6c3.4 2 9.5 2.5 14.4.5"
        fill="none"
        stroke="#FF9900"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="m17.4 16.5 2.6-.5-.9 2.4"
        fill="none"
        stroke="#FF9900"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  // MySQL — the dolphin over the blue cylinder.
  mysql: (
    <>
      {/* The database cylinder */}
      <g fill="#00758F">
        <path d="M4 6.4v11.2c0 1.5 3.6 2.7 8 2.7 1 0 2-.1 2.9-.2V6.9c-.9.3-1.9.4-2.9.4-4.4 0-8-1.2-8-2.7V18Z" opacity="0.9" />
        <path d="M12 4.4c4.4 0 8 1.2 8 2.7S16.4 9.8 12 9.8 4 8.6 4 7.1s3.6-2.7 8-2.7Z" />
      </g>
      {/* The dolphin */}
      <path
        fill="#F29111"
        d="M20.9 5.1c1 1.5 1 3.7-.3 5.6-1.2 1.9-3.2 3.3-5.3 3.9 1-.6 1.8-1.5 2.3-2.5-1.5.3-3 .1-4.3-.6 1-1 1.7-2.2 2-3.5.2-1 .8-1.9 1.7-2.4.7-.4 1.5-.5 2.2-.3.6.1 1.3.4 1.7.8Z"
      />
    </>
  ),
};

export function StackTechIcon({
  name,
  className = '',
}: {
  name: StackIconName;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
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
