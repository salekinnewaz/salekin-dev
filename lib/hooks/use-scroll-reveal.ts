'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * `useScrollReveal` — reveals an element once it scrolls into view.
 *
 * Uses a single IntersectionObserver per element. When the user
 * prefers reduced motion the element is marked visible immediately and
 * the observer is never attached — the content is simply there, with
 * no animation.
 *
 * Returns a ref to attach to the element and whether it has been
 * revealed.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: { threshold?: number; rootMargin?: string; once?: boolean } = {},
) {
  const { threshold = 0.12, rootMargin = '0px 0px -8% 0px', once = true } =
    options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}
