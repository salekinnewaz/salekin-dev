import type { SiteIdentity } from '@/lib/queries/site';

type AboutSectionProps = {
  identity: SiteIdentity;
};

/**
 * About — per brief §4, §6, §12.
 *
 *  - 1 greeting + 1 bio paragraph (personal, brief)
 *  - No achievements, no industries, no stat counters here — those
 *    live in `CurrentRole`, the project descriptions, and `CoreStack`
 *    so each fact has a single primary location.
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
          <h2 className="heading-display heading-underline text-4xl sm:text-5xl">
            A bit about me
          </h2>
        </div>

        <div className="flex flex-col gap-6">
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
        </div>
      </div>
    </section>
  );
}
