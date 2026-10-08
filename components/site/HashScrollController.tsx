'use client';

import { useEffect } from 'react';

/**
 * Two jobs, both delegated to a single piece of client-side glue so they
 * run exactly once per page:
 *
 * 1. When the user lands on a URL with a hash (e.g. `/#about` shared from
 *    somewhere, or a direct `/#contact` link), the browser's default
 *    jump-to-anchor races with the reveal animation: the anchor target
 *    is `opacity: 0` until the IntersectionObserver marks it visible, so
 *    the user lands at the right offset but the section looks blank.
 *    This component waits for two animation frames (so the IO has had
 *    a chance to fire and lay out the visible state) and then performs
 *    a single `scrollIntoView({ behavior: 'auto' })` on the hash target.
 *    Instant jump — not smooth — because the user already waited for
 *    the page to load and a smooth scroll on top of that is jarring.
 *
 * 2. After hydration, intercept in-page anchor clicks and do a smooth
 *    scroll to the target. The browser-native smooth-scroll only fires
 *    if the layout isn't already animating, and reveal transitions
 *    count as "already animating" for a few hundred ms, so the click
 *    often snaps instead. Doing it ourselves gives us a consistent
 *    UX.
 *
 * Respects `prefers-reduced-motion` by switching to an instant jump
 * for both paths.
 */
export function HashScrollController() {
  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const smooth =
      !reduceMotion &&
      typeof window !== 'undefined' &&
      'scrollBehavior' in document.documentElement.style;

    // 1. Initial hash scroll. Skip if there's no hash or it doesn't
    //    resolve to a section on the current page.
    const initialHash = window.location.hash.replace(/^#/, '');
    if (initialHash) {
      const scroll = () => {
        const el = document.getElementById(initialHash);
        if (!el) return;
        // Two RAFs: one to let IO settle, one to let the browser
        // commit layout. Anything less and we can land at the wrong
        // offset (the element is still at its pre-reveal height).
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            el.scrollIntoView({
              behavior: 'auto',
              block: 'start',
            });
            // The section's tabindex=-1 (set in templates) lets us
            // move focus there too, so screen readers announce the
            // new context instead of staying on the previous one.
            if (el.getAttribute('tabindex') === '-1') {
              (el as HTMLElement).focus({ preventScroll: true });
            }
          }),
        );
      };
      // Wait for fonts + first paint before measuring. Reveal classes
      // also get a small CSS transition; a 50ms delay is enough for
      // the IO to have marked already-on-screen elements visible.
      window.setTimeout(scroll, 50);
    }

    // 2. Intercept in-page anchor clicks for smooth scroll.
    function onClick(e: MouseEvent) {
      // Only left-clicks without modifier keys.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const path = e.composedPath();
      const anchor = path.find(
        (n): n is HTMLAnchorElement =>
          n instanceof HTMLAnchorElement,
      );
      if (!anchor) return;

      const href = anchor.getAttribute('href') ?? '';
      // Only handle same-page hash links: "#about" or "/#about" when
      // already on the home page. Anything else (mailto, /projects,
      // external) is left alone.
      const hashIdx = href.indexOf('#');
      if (hashIdx === -1) return;
      const hash = href.slice(hashIdx + 1);
      if (!hash) return;
      // Reject "/something#x" (different route) so we don't fight
      // the browser's full navigation.
      const before = href.slice(0, hashIdx);
      if (before !== '' && before !== '/') return;
      // Reject external hosts.
      if (anchor.origin && anchor.origin !== window.location.origin) return;

      const target = document.getElementById(hash);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start',
      });
      // Keep the URL in sync so back/forward and the active-pill
      // logic both work as expected.
      history.pushState(null, '', `#${hash}`);
      if (target.getAttribute('tabindex') === '-1') {
        (target as HTMLElement).focus({ preventScroll: true });
      }
    }

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
