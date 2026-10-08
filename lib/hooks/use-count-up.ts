'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates an integer from 0 → `target` once the element first enters
 * the viewport. Returns the current numeric value as a string (so the
 * caller can render with a suffix like "+").
 *
 * The initial render returns the *target* value, not 0. This matters:
 *   - SSR / no-JS users see the real number, not a placeholder.
 *   - Search engines see the real number in the HTML.
 *   - We only animate on the client, and we only animate *down* from
 *     the target to 0 and back up, never the other way around.
 *
 * Respects `prefers-reduced-motion`: when reduced motion is on, the
 * hook returns the target value immediately so no animation plays.
 */
export function useCountUp(
  target: number,
  options: { durationMs?: number; decimals?: number; suffix?: string } = {},
): {
  ref: (node: HTMLElement | null) => void;
  display: string;
} {
  const { durationMs = 1200, decimals = 0, suffix = '' } = options;
  const [el, setEl] = useState<HTMLElement | null>(null);
  // Caller passes a callback ref: `ref={(node) => setEl(node)}`.
  // The ref callback signature accepts the specific element type the
  // caller puts it on (HTMLParagraphElement, HTMLSpanElement, etc.)
  // without us having to thread a generic through the hook.
  const ref = (node: HTMLElement | null) => setEl(node);
  // Start at the target so SSR/initial render shows the real number.
  // We briefly dip to 0 on the client and animate up; the dip is a
  // single rAF so the user never sees a zero, just a fast count-up.
  const [value, setValue] = useState(target);
  const hasRun = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasRun.current) return;
    if (!el) return;

    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setValue(target);
      hasRun.current = true;
      return;
    }

    // jsdom (and very old browsers) don't ship IntersectionObserver.
    // In that case just keep the SSR value (which is the target).
    if (typeof IntersectionObserver === 'undefined') {
      hasRun.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hasRun.current) continue;
          hasRun.current = true;
          io.disconnect();
          // Start the visible count from 0. We wait two rAFs so the
          // browser commits the SSR'd value first, otherwise the
          // dip-to-zero and the count-up happen in the same frame
          // and the user sees the SSR value flicker.
          setValue(0);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const start = performance.now();
              const step = (now: number) => {
                const t = Math.min(1, (now - start) / durationMs);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - t, 3);
                setValue(target * eased);
                if (t < 1) requestAnimationFrame(step);
                else setValue(target);
              };
              requestAnimationFrame(step);
            }),
          );
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, durationMs, el]);

  // If the target prop changes after the animation has already run
  // (e.g. an admin edit refreshes the value), reflect the new target
  // without re-animating. The user already saw the count; don't
  // re-run the show.
  useEffect(() => {
    if (hasRun.current) setValue(target);
  }, [target]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return { ref, display: formatted + suffix };
}
