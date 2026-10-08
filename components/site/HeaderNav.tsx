'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  NAV_SECTIONS,
  setActiveSection,
  useActiveSection,
  type NavSectionId,
} from '@/lib/hooks/use-active-section';

type Visibility = Record<NavSectionId, boolean>;

type Props = {
  visible: Visibility;
};

/**
 * Centered pill navigation. The active link gets a sliding gradient
 * background that animates between sections as the user scrolls.
 * Collapses to a hamburger drawer on small screens.
 *
 * When the user is on a non-home page, clicking a section pill
 * navigates back to `/` with the section as a hash so the in-page
 * scroll-spy still highlights correctly.
 */
export function HeaderNav({ visible }: Props) {
  const active = useActiveSection();
  const pathname = usePathname();
  const onHome = pathname === '/';
  const items = NAV_SECTIONS.filter((s) => visible[s.id]);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Shrink the pill slightly after the user has scrolled away from the top
  // — small detail, big polish.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile drawer when the active section changes (i.e. the
  // user navigated). Don't close on the non-home page where `active`
  // doesn't update — keep the drawer state under the user's control.
  useEffect(() => {
    if (onHome) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onHome]);

  // Lock body scroll when the drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop pill */}
      <nav
        aria-label="Section navigation"
        className="pill-nav"
        data-scrolled={scrolled || undefined}
      >
        <ul className="pill-nav__list" role="list">
          {items.map((s) => {
            const isActive = active === s.id && onHome;
            return (
              <li key={s.id} className="pill-nav__item">
                <a
                  // On non-home pages, route to home with the section
                  // hash so the in-page scroll-spy can take over there.
                  href={onHome ? `#${s.id}` : `/#${s.id}`}
                  className="pill-nav__link"
                  data-active={isActive || undefined}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setActiveSection(s.id)}
                >
                  {isActive ? (
                    <span aria-hidden="true" className="pill-nav__indicator" />
                  ) : null}
                  <span className="pill-nav__label">{s.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="hamburger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hamburger__bar" data-open={open || undefined} />
        <span className="hamburger__bar" data-open={open || undefined} />
        <span className="hamburger__bar" data-open={open || undefined} />
      </button>

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        className="drawer"
        data-open={open || undefined}
        aria-hidden={!open}
      >
        <div
          className="drawer__scrim"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div className="drawer__panel" role="dialog" aria-label="Section navigation">
          <div className="drawer__head">
            <span className="drawer__title">Navigate</span>
            <button
              type="button"
              className="drawer__close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ul className="drawer__list" role="list">
            {items.map((s, i) => {
              const isActive = active === s.id && onHome;
              return (
                <li
                  key={s.id}
                  className="drawer__item"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <a
                    href={onHome ? `#${s.id}` : `/#${s.id}`}
                    className="drawer__link"
                    data-active={isActive || undefined}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => {
                      setActiveSection(s.id);
                      setOpen(false);
                    }}
                  >
                    <span className="drawer__index" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <span className="drawer__label">{s.label}</span>
                    {isActive ? (
                      <span className="drawer__dot" aria-hidden="true" />
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="drawer__foot">
            <span className="drawer__hint">tap a section to jump</span>
          </div>
        </div>
      </div>
    </>
  );
}
