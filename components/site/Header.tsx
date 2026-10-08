import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries/site';
import { isAdminConfigured } from '@/lib/security/admin-session';
import { HeaderNav } from './HeaderNav';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

/**
 * Sticky top bar. Brand mark on the left, centered pill nav with section
 * links (animated active state driven by scroll), theme toggle + admin
 * link on the right.
 *
 * The pill itself lives in `HeaderNav` (client) so the active indicator
 * can animate as the user scrolls. Sections mirror `SideNav` so they
 * always agree on which section is "current".
 */
export async function Header() {
  const { identity, sections } = await getSiteSettings();
  const brand = identity.siteTitle || 'salekin.dev';
  const initials = identity.siteInitials || 'SN';

  // Hide links for sections turned off in admin settings.
  const visibleSections = {
    hero: sections.showHero,
    about: sections.showAbout,
    experience: sections.showExperience,
    skills: sections.showSkills,
    education: sections.showEducation,
    contact: sections.showContact,
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          href="/"
          className="brand group"
          aria-label={`${brand} — home`}
        >
          <span className="brand__mark" aria-hidden="true">
            <Logo initials={initials} size="sm" variant="mark" />
          </span>
          <span className="brand__text">
            <span className="brand__name group-hover:text-accent transition-colors">
              {brand}
            </span>
            <span className="brand__suffix" aria-hidden="true">
              .dev
            </span>
          </span>
        </Link>

        <HeaderNav visible={visibleSections} />

        <div className="site-header__actions">
          {isAdminConfigured() ? (
            <Link
              href="/admin/login"
              className="action-pill action-pill--ghost"
              title="Admin sign-in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="action-pill__label">Admin</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="action-pill action-pill--ghost"
              title="Site settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="action-pill__label">Admin</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
