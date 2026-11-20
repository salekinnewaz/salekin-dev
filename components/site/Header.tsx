import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries/site';
import { HeaderNav } from './HeaderNav';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

/**
 * Sticky top bar. Brand mark on the left, centered pill nav with section
 * links (animated active state driven by scroll), theme toggle on the
 * right.
 *
 * The pill itself lives in `HeaderNav` (client) so the active indicator
 * can animate as the user scrolls.
 *
 * NOTE: there is deliberately NO public link to `/admin` here. The admin
 * panel stays reachable by direct URL for the owner, but it is not
 * advertised anywhere in the public UI — see QA item 09 in the refactor
 * spec ("Zero exposed /admin links").
 */
export async function Header() {
  const { identity, sections } = await getSiteSettings();
  const brand = identity.siteTitle || 'salekin.dev';
  const initials = identity.siteInitials || 'SN';

  // Hide links for sections turned off in admin settings.
  // The six numbered modules (Services, Work, Blog, Experience,
  // Reviews, Contact) map to the new page structure. Services, Work
  // and Blog are always surfaced — they are the primary destinations
  // and have no admin toggle.
  const visibleSections = {
    hero: sections.showHero,
    services: true,
    work: true,
    blog: true,
    experience: sections.showExperience,
    reviews: true,
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
