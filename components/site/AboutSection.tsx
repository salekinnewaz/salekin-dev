import type { SiteIdentity, SiteStats } from '@/lib/queries/site';
import type { EducationItem } from '@/lib/queries/education';

type AboutSectionProps = {
  identity: SiteIdentity;
  stats: SiteStats;
  education: EducationItem[];
};

/**
 * About — bio, a one-line fact summary, and a single education entry.
 *
 * The previous iteration had a three-stat counter row and a `$ whoami
 * --short` terminal heading. Both are gone. The counters are folded
 * into a quiet fact line at the end of the bio so the values still
 * read but the section no longer competes with the project cards for
 * visual weight.
 */
export function AboutSection({ identity, stats, education }: AboutSectionProps) {
  const bio = identity.aboutBio;
  // Surface only the highest-ranked education entry (BSc). The DB
  // also holds HSC and SSC but those don't belong on a professional
  // portfolio.
  const primary = education[0] ?? null;

  return (
    <section
      id="about"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-3 reveal">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            About
          </span>
          <h2 className="heading-display text-4xl sm:text-5xl">
            A bit about me
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

          <div className="flex flex-col gap-3 border-t border-border pt-6 reveal">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              <span aria-hidden="true" className="text-accent-2">$</span>{' '}
              stat --summary
            </p>
            <p className="text-sm text-fg-2 text-pretty sm:text-base">
              <span className="text-fg">{stats.yearsCoding}+</span> years
              coding ·{' '}
              <span className="text-fg">{stats.sitesShipped}</span> sites
              shipped ·{' '}
              <span className="text-fg">{stats.rolesHeld}</span> roles held.
            </p>
          </div>

          {primary ? (
            <div className="flex flex-col gap-1 border-t border-border pt-6 reveal">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Education
              </p>
              <p className="text-sm text-fg-2 text-pretty sm:text-base">
                <span className="text-fg">{primary.degree}</span> ·{' '}
                {primary.institution} · {primary.startYear}–
                {primary.endYear}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
