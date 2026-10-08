'use client';

import { useEffect } from 'react';

/**
 * Global IntersectionObserver that turns `.reveal` and `.reveal-stagger`
 * into `.is-visible` when they scroll into view. Runs once for the page.
 *
 * The hide rules in `globals.css` are gated behind `.js`, so content is
 * fully visible if this component never mounts. The boot script in
 * `app/layout.tsx` pre-marks above-the-fold targets; this observer
 * handles everything below the fold.
 */
export function RevealObserver() {
  useEffect(() => {
    const reveal = (el: Element) => {
      const t = el as HTMLElement;
      t.classList.add('is-visible');
      t.setAttribute('data-reveal-shown', '');
    };

    const observe = () => {
      const targets = document.querySelectorAll<HTMLElement>(
        '.reveal:not(.is-visible):not([data-reveal-shown]), .reveal-stagger:not(.is-visible):not([data-reveal-shown])',
      );
      if (targets.length === 0) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              reveal(entry.target);
              obs.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
      );

      for (const el of targets) observer.observe(el);
      return () => observer.disconnect();
    };

    // First pass: pick up whatever the boot script didn't already show.
    const cleanup = observe();

    // Second pass: catch targets that were streamed in after the initial
    // render (e.g. after route transitions or when RevealObserver mounts
    // before some sibling client component). Cheap and bounded.
    const t = window.setTimeout(observe, 250);

    return () => {
      cleanup?.();
      window.clearTimeout(t);
    };
  }, []);

  return null;
}