'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates an integer from 0 → `target` once the element first enters
 * the viewport. Returns the current numeric value as a string (so the
 * caller can render with a suffix like "+").
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
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    if (!el) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(target);
      hasRun.current = true;
      return;
    }

    // jsdom (and very old browsers) don't ship IntersectionObserver.
    // In that case just snap to the target — the animation is a
    // progressive enhancement, not a hard requirement.
    if (typeof IntersectionObserver === 'undefined') {
      setValue(target);
      hasRun.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hasRun.current) continue;
          hasRun.current = true;
          io.disconnect();
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
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, durationMs]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return { ref, display: formatted + suffix };
}
