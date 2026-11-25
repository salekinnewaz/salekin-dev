'use client';

import { useEffect, useRef, useState } from 'react';
import {
  NAV_SECTIONS,
  setActiveSection,
  useActiveSection,
  sectionHref,
  type NavSectionId,
} from '@/lib/hooks/use-active-section';
import { ThemeToggle } from './ThemeToggle';

/**
 * Floating glass pill navbar.
 *
 * Structure (Phase 2 of the refactor spec):
 *   Left   — gradient monogram badge + "salekin.dev" wordmark.
 *   Center — 6 links inside a subtle pill bar with a scroll-spy
 *            active indicator.
 *   Right  — theme toggle + emerald→cyan "Book QA Audit →" CTA, plus a
 *            slide-down drawer on small screens.
 *
 * The whole bar is fixed to the top of the viewport with a backdrop
 * blur, so it floats over the content rather than pushing it down.
 * That is why `html` carries `scroll-padding-top: 84px` — the browser
 * needs to know how much room the floating bar occupies when a hash
 * link is followed.
 */

const NAV_ITEMS = NAV_SECTIONS.filter((s) => s.id !== 'hero');

export function Navbar() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /*
    The navbar is fixed, so it floats over the document. The hero is the
    first thing in the document and needs to know how much room the
    navbar occupies, or its first row of content slides underneath.

    Rather than hard-coding a height that would drift the moment the
    navbar's padding or breakpoint behaviour changed, the bar measures
    itself and publishes the result to `--nav-height`. The hero reads
    that variable for its top padding, so the two can never disagree.

    A `ResizeObserver` covers breakpoint changes (the bar's height
    differs between the mobile and desktop layouts); the scroll
    listener only re-runs it because the bar's own padding changes
    once it gains its scrolled state.
  */
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const publish = () => {
      const height = Math.ceil(bar.getBoundingClientRect().height);
      // The bar's own offset from the top of the viewport is part of
      // the space it occupies.
      const top = Math.ceil(bar.getBoundingClientRect().top + window.scrollY);
      const total = height + (top || 0);
      document.documentElement.style.setProperty(
        '--nav-height',
        `${total}px`,
      );
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the drawer is open so the page behind it
  // cannot be scrolled into a different position.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-5 sm:pt-4">
      <div
        ref={barRef}
        className={`mx-auto flex max-w-[1480px] items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-[background-color,border-color,box-shadow] duration-200 sm:px-4 ${
          scrolled
            ? 'border-[var(--color-border-strong)] bg-[color-mix(in_oklab,var(--color-card)_78%,transparent)] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl'
            : 'border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-card)_55%,transparent)] backdrop-blur-xl'
        }`}
      >
        {/* ─── Brand ─── */}
        <a
          href="#hero"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="salekin.dev — home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] font-mono text-[0.7rem] font-bold text-white shadow-[0_4px_14px_-6px_var(--color-accent)] transition-transform group-hover:scale-105"
          >
            SN
          </span>
          <span className="font-mono text-[0.82rem] font-semibold tracking-tight text-[var(--color-fg)]">
            salekin
            <span className="text-[var(--color-accent)]">.dev</span>
          </span>
        </a>

        {/* ─── Center pill nav (desktop) ─── */}
        <nav
          aria-label="Section navigation"
          className="hidden lg:block"
        >
          <ul className="flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-2)] p-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id, '/')}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    data-active={isActive || undefined}
                    className={`relative block rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                    }`}
                  >
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      />
                    ) : null}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ─── Right actions ─── */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <a
            href="#contact"
            className="hidden rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-[0.8rem] font-semibold text-white shadow-[0_6px_20px_-8px_var(--color-accent)] transition-[filter,transform] hover:brightness-110 active:translate-y-px sm:inline-flex"
          >
            Book QA Audit <span aria-hidden="true">→</span>
          </a>

          {/* Mobile drawer trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className={open ? 'hidden' : 'block'}
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className={open ? 'block' : 'hidden'}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Mobile slide-down drawer ─── */}
      <div
        id="mobile-nav-drawer"
        className={`mx-auto mt-2 max-w-[1480px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-card)_92%,transparent)] backdrop-blur-xl transition-[max-height,opacity,margin] duration-300 lg:hidden ${
          open ? 'mb-2 max-h-[26rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col p-2">
          {NAV_ITEMS.map((item, i) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={sectionHref(item.id, '/')}
                  onClick={() => {
                    setActiveSection(item.id);
                    setOpen(false);
                  }}
                  aria-current={isActive ? 'location' : undefined}
                  style={{ transitionDelay: open ? `${i * 30}ms` : '0ms' }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                      : 'text-[var(--color-fg-2)] hover:bg-[var(--color-bg-2)]'
                  }`}
                >
                  <span className="font-mono text-[0.68rem] text-[var(--color-muted)]">
                    0{i + 1}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-[var(--color-border)] p-2">
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Book QA Audit <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/** Re-exported so the server header can type the visibility map. */
export type { NavSectionId };
