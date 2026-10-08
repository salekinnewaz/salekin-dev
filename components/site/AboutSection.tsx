import type { SiteIdentity } from '@/lib/queries/site';
import { CountUpStat } from './CountUpStat';
import { SectionDivider } from './SectionDivider';

type AboutSectionProps = {
  identity: SiteIdentity;
};

/**
 * About panel: pull-quote, bio paragraph, then the count-up stats row.
 *
 * The "Currently building / learning / reading" trio that used to live
 * here has been promoted to its own `CurrentlyBuildingSection` further
 * up the page, so a recruiter's eye doesn't have to jump around.
 */
export function AboutSection({ identity }: AboutSectionProps) {
  const bio = identity.aboutBio;

  return (
    <section
      id="about"
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
            <CountUpStat value={5} suffix="+" tone="accent" label="Years coding" />
            <CountUpStat value={24} tone="accent-2" label="Sites shipped" />
            <CountUpStat value={5} tone="accent" label="Roles held" />
          </div>
        </div>
      </div>
    </section>
  );
}
