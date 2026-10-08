import type { CSSProperties } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Variant = 'mark' | 'wordmark' | 'full';

type Props = {
  /**
   * Optional label for the mark. Rendered as the alt text on the
   * <img>. Defaults to "Salekin Newaz logo".
   */
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

/** Path to the public logo asset (served from /public). */
const LOGO_SRC = '/images/logo.png';

/**
 * The site logo. Three variants:
 *   - "mark"     → the real logo image (rounded chamfered gradient
 *                  square with the SN monogram). Use in tight spaces
 *                  (header chip, favicon).
 *   - "wordmark" → "Salekin Newaz .dev" text in the brand mono font.
 *   - "full"     → mark + wordmark side by side (default).
 *
 * The mark is the real logo asset served from /public. We render it
 * via <img> rather than an inline SVG so the user's exact logo
 * artwork is preserved (gradients, glow, monogram details).
 */
export function Logo({
  initials = 'Salekin Newaz',
  size = 'md',
  variant = 'full',
  className,
  style,
  decorative = false,
}: Props) {
  const px = SIZE_PX[size];
  const mark = <LogoMark label={initials} px={px} />;
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

function LogoMark({ label, px }: { label: string; px: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt={`${label} logo`}
      width={px}
      height={px}
      loading="eager"
      decoding="async"
      style={{
        display: 'block',
        flex: '0 0 auto',
        width: px,
        height: px,
      }}
    />
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
