import type { CSSProperties } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Variant = 'mark' | 'wordmark' | 'full';

type Props = {
  /** The 1–2 letter monogram. Defaults to "SN". */
  initials?: string;
  size?: Size;
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
  /** Decorative only — hides from assistive tech when true. */
  decorative?: boolean;
};

const SIZE_PX: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 56,
  xl: 96,
};

const FONT_PX: Record<Size, number> = {
  sm: 11,
  md: 13,
  lg: 19,
  xl: 30,
};

/**
 * The site logo. Three variants:
 *   - "mark"     → just the chamfered gradient square with a custom
 *                  monogram. Use in tight spaces (header chip, favicon).
 *   - "wordmark" → "Salekin Newaz .dev" text in the brand mono font.
 *   - "full"     → mark + wordmark side by side (default).
 *
 * The mark is a chamfered (corner-clipped) gradient square with a
 * custom-drawn monogram. For two-letter initials we draw a geometric
 * "SX" / "SN" shape: a diagonal slash bisects the square, the first
 * letter sits in the top-left half, the second in the bottom-right.
 * For one-letter initials we use a slightly chunkier rendering of
 * the single letter.
 *
 * The whole mark is one self-contained SVG so it can be used as a
 * favicon source, an OG image accent, or anywhere else we need a
 * brand asset.
 */
export function Logo({
  initials = 'SN',
  size = 'md',
  variant = 'full',
  className,
  style,
  decorative = false,
}: Props) {
  const px = SIZE_PX[size];
  const mark = <LogoMark initials={initials} px={px} />;
  const wordmark = <LogoWordmark px={px} />;

  if (variant === 'mark') {
    return (
      <span className={className} style={style} aria-hidden={decorative || undefined}>
        {mark}
      </span>
    );
  }
  if (variant === 'wordmark') {
    return (
      <span
        className={className}
        style={style}
        aria-hidden={decorative || undefined}
      >
        {wordmark}
      </span>
    );
  }

  // full
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: px / 4, ...style }}
      aria-hidden={decorative || undefined}
    >
      {mark}
      {wordmark}
    </span>
  );
}

/* ─── Mark ─────────────────────────────────────────────────────── */

function LogoMark({ initials, px }: { initials: string; px: number }) {
  const upper = (initials || 'SN').toUpperCase().slice(0, 2);
  const id = `sn-grad-${px}`;

  // Geometry — chamfered square. The clipPath cuts a 22% triangle off
  // each corner, giving a "developer badge" look without looking like
  // a generic rounded-rect.
  const corner = px * 0.22;
  const fontSize = FONT_PX[px <= 28 ? 'sm' : px <= 40 ? 'md' : px <= 70 ? 'lg' : 'xl'];

  // The mark is laid out on a `viewBox` of 100 and we scale to `px`.
  // Coordinates:
  //   - outer chamfered square 0,0 → 100,100 with cut at (22,0)/(100,78) etc.
  //   - inner diagonal slash  runs from (24,76) to (76,24)
  //   - first letter sits in the top-left triangle (above the slash)
  //   - second letter sits in the bottom-right triangle (below the slash)
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${initials} logo`}
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-accent, #a78bfa)" />
          <stop offset="100%" stopColor="var(--color-accent-2, #22d3ee)" />
        </linearGradient>
      </defs>

      {/* Chamfered square, filled with the gradient */}
      <path
        d={`M ${corner} 0
            L 100 0
            L 100 ${100 - corner}
            L ${100 - corner} 100
            L 0 100
            L 0 ${corner} Z`}
        fill={`url(#${id})`}
      />

      {/* Diagonal slash that bisects the mark — the visual hook that
          says "code / developer" without being on-the-nose */}
      <line
        x1="26"
        y1="74"
        x2="74"
        y2="26"
        stroke="rgba(255, 255, 255, 0.32)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Letters — drawn in the on-theme background color so they sit
          on top of the gradient */}
      <g
        fill="var(--color-bg, #0b0b10)"
        fontFamily="ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace"
        fontWeight="800"
        fontSize={fontSize * 2.6}
        style={{ letterSpacing: '-0.04em' }}
      >
        {upper.length === 2 ? (
          <>
            {/* Top-left half: first letter, anchored to bottom-right
                of its cell so it tucks into the slash */}
            <text
              x="38"
              y="44"
              textAnchor="middle"
              dominantBaseline="alphabetic"
            >
              {upper[0]}
            </text>
            {/* Bottom-right half: second letter */}
            <text
              x="66"
              y="86"
              textAnchor="middle"
              dominantBaseline="alphabetic"
            >
              {upper[1]}
            </text>
          </>
        ) : (
          <text x="50" y="66" textAnchor="middle" dominantBaseline="alphabetic">
            {upper[0]}
          </text>
        )}
      </g>
    </svg>
  );
}

/* ─── Wordmark ─────────────────────────────────────────────────── */

function LogoWordmark({ px }: { px: number }) {
  const nameSize = Math.max(13, Math.round(px * 0.45));
  const suffixSize = Math.max(11, Math.round(px * 0.4));
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 2,
        fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
        fontWeight: 600,
        fontSize: nameSize,
        letterSpacing: '-0.01em',
        lineHeight: 1,
      }}
    >
      <span>Salekin Newaz</span>
      <span style={{ color: 'var(--color-muted)', fontWeight: 500, fontSize: suffixSize }}>
        .dev
      </span>
    </span>
  );
}

/* ─── Bare SVG export (for favicon / OG use) ───────────────────── */

/**
 * Returns the mark as a static SVG string with the gradient baked in
 * as concrete colors. Useful for places that need a raw SVG — favicons,
 * OG image composition, email signatures, etc.
 */
export function logoMarkSvgString(initials: string = 'SN', size = 64): string {
  const corner = size * 0.22;
  const upper = (initials || 'SN').toUpperCase().slice(0, 2);
  const fontSize = size * 0.42;
  const accent = '#a78bfa';
  const accent2 = '#22d3ee';
  const bg = '#0b0b10';
  const id = 'sn-grad-static';

  const letters =
    upper.length === 2
      ? `<text x="38%" y="44%" text-anchor="middle" fill="${bg}" font-family="ui-monospace,Menlo,monospace" font-weight="800" font-size="${fontSize}" letter-spacing="-0.04em">${upper[0]}</text>` +
        `<text x="66%" y="86%" text-anchor="middle" fill="${bg}" font-family="ui-monospace,Menlo,monospace" font-weight="800" font-size="${fontSize}" letter-spacing="-0.04em">${upper[1]}</text>`
      : `<text x="50%" y="66%" text-anchor="middle" fill="${bg}" font-family="ui-monospace,Menlo,monospace" font-weight="800" font-size="${fontSize}" letter-spacing="-0.04em">${upper[0]}</text>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${accent}"/>` +
    `<stop offset="100%" stop-color="${accent2}"/>` +
    `</linearGradient></defs>` +
    `<path d="M ${corner} 0 L 100 0 L 100 ${100 - corner} L ${100 - corner} 100 L 0 100 L 0 ${corner} Z" fill="url(#${id})"/>` +
    `<line x1="26" y1="74" x2="74" y2="26" stroke="rgba(255,255,255,0.32)" stroke-width="3" stroke-linecap="round"/>` +
    letters +
    `</svg>`
  );
}
