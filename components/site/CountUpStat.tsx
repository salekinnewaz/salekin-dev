'use client';

import { useCountUp } from '@/lib/hooks/use-count-up';

type Props = {
  value: number;
  /** Suffix appended to the number, e.g. "+" for "5+" */
  suffix?: string;
  /** Decimals to render. Default 0. */
  decimals?: number;
  /** Color token: "accent" or "accent-2" */
  tone?: 'accent' | 'accent-2';
  /** Label rendered under the number */
  label: string;
};

/**
 * Single animated stat used in the About section: a large number
 * (colored with the gradient) that counts up from 0 on first
 * intersection, with a small mono caption beneath.
 */
export function CountUpStat({
  value,
  suffix = '',
  decimals = 0,
  tone = 'accent',
  label,
}: Props) {
  const { ref, display } = useCountUp(value, {
    suffix,
    decimals,
    durationMs: 1100,
  });
  const toneClass = tone === 'accent-2' ? 'text-accent-2' : 'text-accent';
  return (
    <div>
      <p
        ref={ref}
        className={`heading-display text-3xl tabular-nums ${toneClass}`}
      >
        {display}
      </p>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </p>
    </div>
  );
}
