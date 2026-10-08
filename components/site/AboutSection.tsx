import type { SiteIdentity } from '@/lib/queries/site';

type AboutSectionProps = {
  identity: SiteIdentity;
};

const INDUSTRIES = [
  'Logistics',
  'Oil & Gas',
  'IoT',
  'E-commerce',
  'Rideshare',
] as const;

const FACTS = [
  {
    label: '4+ concurrent international projects',
    detail:
      'QA lead across logistics, oil & gas, IoT, e-commerce and rideshare.',
  },
  {
    label: 'Up to 60% reduction in regression cycles',
    detail: 'Playwright automation and CI/CD integration.',
  },
  {
    label: '3 production releases · Norway client',
    detail: 'UAT coordination, client sign-off, release readiness.',
  },
  {
    label: 'International exposure',
    detail: 'Norway · Canada · USA',
  },
  {
    label: 'Mentored junior QA engineers',
    detail: 'Code reviews, test architecture guidance, Playwright training.',
  },
] as const;

/**
 * About — per brief §4, §6, §12.
 *
 *  - 2 short paragraphs (split from `aboutBio` on `\n\n`)
 *  - 1 quiet industries tag row
 *  - 5 condensed fact lines from the verified achievements
 *  - No stat counter row (the 4/24/5 "sites shipped" framing doesn't
 *    fit a QA story)
 *  - No education line here — that has its own section now
 */
export function AboutSection({ identity }: AboutSectionProps) {
  const bio = identity.aboutBio;
  // SEO: lead with a "Hi, I'm <full name>." sentence so the about
  // section has the name in visible on-page text (search engines
  // weight body text heavily for name queries).
  const greeting = `Hi, I’m ${identity.siteTitle}.`;
  const bioParagraphs = bio
    ? bio.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [];
  const paragraphs = [greeting, ...bioParagraphs];

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
          {paragraphs.length > 0 ? (
            <div
              className="flex flex-col gap-5 reveal"
              data-testid="about-bio"
            >
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-fg-2 sm:text-lg text-pretty"
                >
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No bio available.</p>
          )}

          <div className="flex flex-col gap-3 reveal">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Industries
            </p>
            <ul className="flex flex-wrap gap-1.5" role="list">
              {INDUSTRIES.map((i) => (
                <li key={i} role="listitem">
                  <span className="tag">{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6 reveal">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Highlights
            </p>
            <ul className="flex flex-col gap-2.5" role="list">
              {FACTS.map((f) => (
                <li
                  key={f.label}
                  className="flex gap-2.5 text-sm leading-relaxed text-fg-2 sm:text-base"
                  role="listitem"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>
                    <span className="text-fg">{f.label}</span>
                    <span className="text-muted"> — {f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
