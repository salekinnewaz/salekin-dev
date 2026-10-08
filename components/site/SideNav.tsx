'use client';

import { useActiveSection, setActiveSection, NAV_SECTIONS } from '@/lib/hooks/use-active-section';

/**
 * Vertical scroll-spy nav. Hidden on small screens (side rail is desktop only).
 * Subscribes to the same shared observer as `HeaderNav` so they always agree
 * on which section is "current".
 */
export function SideNav() {
  const active = useActiveSection();
  const visible = NAV_SECTIONS.filter((s) => s.id !== 'hero'); // hero already has brand link to "/"

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:left-10"
    >
      <ul className="side-nav__list">
        {visible.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="side-nav__item">
              <a
                href={`#${s.id}`}
                className="side-nav__link"
                data-active={isActive || undefined}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="side-nav__dot" aria-hidden="true" />
                <span className="side-nav__label">{s.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
