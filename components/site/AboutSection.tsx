import type { SiteIdentity, SiteStats } from '@/lib/queries/site';
import { CountUpStat } from './CountUpStat';
import { SectionDivider } from './SectionDivider';

type AboutSectionProps = {
  identity: SiteIdentity;
  stats: SiteStats;
};

/**
 * About panel: pull-quote, bio paragraph, then the count-up stats row.
 *
 * The "Currently building / learning / reading" trio that used to live
 * here has been promoted to its own `CurrentlyBuildingSection` further
 * up the page, so a recruiter's eye doesn't have to jump around.
 *
 * Stat values come from `SiteStats` (read from the DB) and are
 * admin-editable. We render the real value in SSR — the count-up
 * animation is a client-side enhancement layered on top.
 */
export function AboutSection({ identity, stats }: AboutSectionProps) {
  const bio = identity.aboutBio;

  return (
    <section
      id="about"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-4 reveal">
          <SectionDivider name="about" trailing="// stack + background" />
          <h2 className="heading-display text-4xl sm:text-5xl">
            <span className="font-mono text-accent-2">$</span>{' '}
            <span className="text-fg">whoami</span>
            <span className="text-muted"> --short</span>
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {bio ? (
            <p
              className="text-base leading-relaxed text-fg-2 sm:text-lg text-pretty reveal"
              data-testid="about-bio"
            >
              {bio}
            </p>
          ) : (
            <p className="text-sm text-muted">No bio available.</p>
          )}

          <div className="grid grid-cols-3 gap-6 border-t border-border pt-6 reveal-stagger">
            <CountUpStat
              value={stats.yearsCoding}
              suffix="+"
              tone="accent"
              label="Years coding"
            />
            <CountUpStat
              value={stats.sitesShipped}
              tone="accent-2"
              label="Sites shipped"
            />
            <CountUpStat
              value={stats.rolesHeld}
              tone="accent"
              label="Roles held"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
