'use client';

import { useEffect, useState } from 'react';

/**
 * Section IDs that the scroll-spy tracks. Kept in sync with SideNav
 * and HeaderNav so they highlight the same section at the same time.
 *
 * Order here = order rendered on the page. We surface "Work" (the
 * case studies section) ahead of the static experience section, and
 * demote Education out of the top-nav since it's a small footer-style
 * row. The order below is what both header and side nav reflect.
 */
export const NAV_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Stack' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

export type NavSectionId = (typeof NAV_SECTIONS)[number]['id'];

/**
 * Build the href for a section link.
 *
 * - On the home page the link is a bare hash so the in-page scroll-spy
 *   picks it up without a navigation round-trip.
 * - On any other route (e.g. /projects, /projects/[slug], /admin/...)
 *   the link routes back to "/" with the section as a hash, so the
 *   browser actually scrolls when the user clicks.
 *
 * Centralised here so every nav surface (Header, HeaderNav, SideNav,
 * Hero CTAs) can ask for a known-correct href.
 */
export function sectionHref(id: NavSectionId, pathname: string | null): string {
  const onHome = pathname === '/';
  return onHome ? `#${id}` : `/#${id}`;
}

/**
 * One IO instance is shared across the page so we don't pay the cost
 * twice (HeaderNav + SideNav). It's owned by the first caller; subsequent
 * callers just subscribe to the published active id.
 */
const EVENT = 'specmd:active-section';

let io: IntersectionObserver | null = null;
let published: NavSectionId = (() => {
  // The layout's boot script may have primed this from the URL hash
  // (e.g. when the user lands directly on /#about). Read it back so
  // the very first React render matches the URL.
  if (typeof window === 'undefined') return 'hero';
  const primed = (window as unknown as { __specmdActive?: string }).__specmdActive;
  if (primed && (NAV_SECTIONS as readonly { id: string }[]).some((s) => s.id === primed)) {
    return primed as NavSectionId;
  }
  return 'hero';
})();

/**
 * When the user clicks a pill, the browser kicks off a smooth scroll to the
 * target section. During that scroll the IntersectionObserver fires
 * continuously, and if the target section is taller than the viewport the
 * IO will momentarily report *some other* section as more-intersecting,
 * snapping the highlight away from the pill the user just chose. We track
 * a recent click and ignore IO events that arrive within a short grace
 * window so the user's intent wins. `null` means "no active lock".
 */
let clickLockUntil = 0;
const CLICK_LOCK_MS = 900;

/** Test helper: reset the module's cached active section. */
export function __resetActiveSectionForTests(value: NavSectionId = 'hero'): void {
  published = value;
  clickLockUntil = 0;
}

function setActive(next: NavSectionId, opts: { fromClick?: boolean } = {}) {
  // The click path arms `clickLockUntil` so the IO events that fire while
  // the browser is smooth-scrolling can't yank the highlight away from
  // the pill the user chose. But the click itself must always go through,
  // and the lock must NOT block our own setActive from the click handler.
  if (
    !opts.fromClick &&
    Date.now() < clickLockUntil &&
    next !== published
  ) return;
  if (next === published) return;
  published = next;
  window.dispatchEvent(new CustomEvent<NavSectionId>(EVENT, { detail: next }));
}

function readHashSection(): NavSectionId | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  for (const s of NAV_SECTIONS) {
    if (s.id === hash) return s.id;
  }
  return null;
}

function ensureObserver() {
  if (io || typeof window === 'undefined') return;
  if (typeof window.IntersectionObserver === 'undefined') {
    // Older browsers / test envs: keep `published` at the default and let
    // the links still work, just without the live highlight.
    return;
  }
  io = new IntersectionObserver(
    (entries) => {
      // Pick the most-intersecting section among the latest entries.
      const hit = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit) {
        setActive(hit.target.id as NavSectionId);
        return;
      }
      // No section is currently intersecting (e.g. user is between two
      // sections, or the page was loaded with a hash that placed the
      // target outside the IO rootMargin). Fall back to whichever
      // section the URL hash claims is active, then to the section
      // closest to the current scroll position.
      const fromHash = readHashSection();
      if (fromHash) {
        setActive(fromHash);
        return;
      }
      const fromScroll = nearestSectionToViewport();
      if (fromScroll) setActive(fromScroll);
    },
    // Generous rootMargin: a section is "active" when any part of it is in
    // the top 25% or bottom 25% of the viewport, so even a hash navigation
    // that lands a section right at the top of the screen still fires.
    { rootMargin: '-25% 0px -75% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  for (const id of NAV_SECTIONS) {
    const el = document.getElementById(id.id);
    if (el) io.observe(el);
  }
}

/** Find the section whose vertical midpoint is closest to the viewport midpoint. */
function nearestSectionToViewport(): NavSectionId | null {
  if (typeof window === 'undefined') return null;
  const vpMid = window.innerHeight / 2;
  let bestId: NavSectionId | null = null;
  let bestDist = Infinity;
  for (const s of NAV_SECTIONS) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    const mid = r.top + r.height / 2;
    const dist = Math.abs(mid - vpMid);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = s.id;
    }
  }
  return bestId;
}

/**
 * Optimistically publish a section as active. Call this from a click
 * handler so the highlighted pill follows the user's intent *before* the
 * IO catches up (e.g. when the target section is already on screen and
 * the IO would never fire a fresh entry for it). Also arms a short
 * "click lock" so the smooth-scroll IO events that fire during the next
 * ~900ms don't yank the highlight back to whatever section is briefly
 * more-intersecting.
 */
export function setActiveSection(id: NavSectionId): void {
  if (typeof window === 'undefined') return;
  clickLockUntil = Date.now() + CLICK_LOCK_MS;
  setActive(id, { fromClick: true });
}

/**
 * Returns the currently active section id and re-renders when it changes.
 * Safe to call from multiple components; only the first caller creates the
 * shared observer.
 */
export function useActiveSection(): NavSectionId {
  const [active, setActiveState] = useState<NavSectionId>(published);
  useEffect(() => {
    // Pick up the URL hash on mount and any time it changes (back/forward,
    // typed URL, hash link click, etc.). The IO observer's first event
    // will usually fire on its own, but this guarantees the highlighted
    // pill matches the URL even before the IO settles.
    const sync = () => {
      const fromHash = readHashSection();
      if (fromHash) setActive(fromHash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    ensureObserver();
    const onActive = (e: Event) => {
      const ce = e as CustomEvent<NavSectionId>;
      setActiveState(ce.detail);
    };
    window.addEventListener(EVENT, onActive);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener(EVENT, onActive);
    };
  }, []);
  return active;
}
