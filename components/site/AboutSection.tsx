import type { SiteIdentity } from '@/lib/queries/site';
import { NowWidget } from './NowWidget';
import { CountUpStat } from './CountUpStat';

type AboutSectionProps = {
  identity: SiteIdentity;
};

const DEFAULT_NOW = {
  building:
    'Internal tooling at Braintree — shipping fast, scrappy, and small.',
  learning: 'Distributed systems and Postgres internals.',
  reading: '"Designing Data-Intensive Applications" — again.',
};

/**
 * About panel: pull-quote, bio paragraph, "Currently" trio with a live
 * UTC+6 clock, then the count-up stats row.
 *
 * The "Currently" trio replaces the original "wall of bio" with three
 * cards that each answer a different question a hiring manager asks:
 *   - what are you shipping right now?
 *   - what are you learning right now?
 *   - what are you reading right now?
 *
 * The first card has a live ticking clock, so the section visibly
 * updates while the page sits there — the same trick Linear and
 * Vercel use to make their sites feel "alive."
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
          <span className="eyebrow">About</span>
          <h2 className="heading-display text-4xl sm:text-5xl">
            <span className="text-fg">A bit </span>
            <span className="heading-gradient">about me.</span>
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

          <NowWidget
            building={DEFAULT_NOW.building}
            learning={DEFAULT_NOW.learning}
            reading={DEFAULT_NOW.reading}
          />

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
