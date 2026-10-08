import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
import { Hero } from '@/components/site/Hero';
import { FeaturedProjects } from '@/components/site/FeaturedProjects';
import { CurrentlyBuildingSection } from '@/components/site/CurrentlyBuildingSection';
import { AboutSection } from '@/components/site/AboutSection';
import { ApproachSection } from '@/components/site/ApproachSection';
import { DifferentiationSection } from '@/components/site/DifferentiationSection';
import { ExperienceTimeline } from '@/components/site/ExperienceTimeline';
import { SkillGrid } from '@/components/site/SkillGrid';
import { EducationList } from '@/components/site/EducationList';
import { ContactSection } from '@/components/site/ContactSection';
import { SectionDivider } from '@/components/site/SectionDivider';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Software engineer building full-stack apps with TypeScript, React, and Next.js. See my work, experience, stack, and how to get in touch.',
};

export default async function HomePage() {
  const [site, experiences, education] = await Promise.all([
    getSiteSettings(),
    listExperiencesOrdered(),
    listEducationOrdered(),
  ]);

  const { identity, sections } = site;
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';

  // WebSite + Person + BreadcrumbList JSON-LD for SEO. All values come
  // from real identity / settings data — no invented profiles.
  const websiteJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'salekin.dev',
    url: siteUrl,
    description: metadata.description,
  };
  const personJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.siteTitle,
    jobTitle: 'Software Engineer',
    url: siteUrl,
    email: identity.contactEmail ?? undefined,
    address: identity.contactLocation ?? undefined,
    sameAs: [
      identity.socialGithub,
      identity.socialLinkedin,
      identity.socialFacebook,
      identity.socialX,
    ].filter((x): x is string => Boolean(x)),
  };

  return (
    <div className="flex flex-col">
      {sections.showHero ? <Hero identity={identity} /> : null}

      {/* Featured Work — pulled from the same listPublishedProjects()
          query the /projects page uses. Renders nothing if empty.
          Wrapped in <Suspense> so it streams independently of the
          page's main data fetch (and so the test renderer can
          resolve it through a Suspense boundary). */}
      <Suspense fallback={null}>
        <FeaturedProjects limit={3} />
      </Suspense>

      {/* Currently Building — promoted from inside AboutSection. */}
      <CurrentlyBuildingSection experiences={experiences} />

      {sections.showAbout ? <AboutSection identity={identity} /> : null}

      <ApproachSection />

      <DifferentiationSection />

      {sections.showExperience ? (
        <section
          id="experience"
          tabIndex={-1}
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="flex flex-col gap-4 reveal">
            <SectionDivider name="experience" trailing="// git log --oneline" />
            <h2 className="heading-display text-4xl sm:text-5xl">
              <span className="font-mono text-accent-2">$</span>{' '}
              <span className="text-fg">cat ./career.log</span>
            </h2>
          </div>
          <div className="mt-10">
            <ExperienceTimeline experiences={experiences} />
          </div>
        </section>
      ) : null}

      {sections.showSkills ? (
        <section
          id="skills"
          tabIndex={-1}
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="flex flex-col gap-4 reveal">
            <SectionDivider name="stack" trailing="// tech I reach for" />
            <h2 className="heading-display text-4xl sm:text-5xl">
              <span className="font-mono text-accent-2">$</span>{' '}
              <span className="text-fg">grep -rE</span>{' '}
              <span className="heading-gradient">&quot;tech|tool|skill&quot;</span>{' '}
              <span className="text-muted">./</span>
            </h2>
          </div>
          <div className="mt-10">
            <SkillGrid skills={site.skills} />
          </div>
        </section>
      ) : null}

      {sections.showEducation ? (
        <section
          id="education"
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="flex flex-col gap-4 reveal">
            <SectionDivider name="education" trailing="// coursework + degree" />
            <h2 className="heading-display text-4xl sm:text-5xl">
              <span className="font-mono text-accent-2">$</span>{' '}
              <span className="text-fg">man</span>{' '}
              <span className="heading-gradient">salekin</span>
            </h2>
          </div>
          <div className="mt-10">
            <EducationList education={education} />
          </div>
        </section>
      ) : null}

      {sections.showContact ? <ContactSection identity={identity} /> : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </div>
  );
}