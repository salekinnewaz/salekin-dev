import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
import { Hero } from '@/components/site/Hero';
import { FeaturedProjects } from '@/components/site/FeaturedProjects';
import { ExperienceTimeline } from '@/components/site/ExperienceTimeline';
import { HowIBuild } from '@/components/site/HowIBuild';
import { CoreStack } from '@/components/site/CoreStack';
import { AboutSection } from '@/components/site/AboutSection';
import { ContactSection } from '@/components/site/ContactSection';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Software engineer building reliable digital products with TypeScript, React, and Next.js. See my work, experience, stack, and how to get in touch.',
};

export default async function HomePage() {
  const [site, experiences, education] = await Promise.all([
    getSiteSettings(),
    listExperiencesOrdered(),
    listEducationOrdered(),
  ]);

  const { identity, sections, stats } = site;
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';

  // WebSite + Person JSON-LD for SEO. All values come from real
  // identity / settings data — no invented profiles.
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

      <Suspense fallback={null}>
        <FeaturedProjects limit={3} />
      </Suspense>

      {sections.showExperience ? (
        <section
          id="experience"
          tabIndex={-1}
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="mb-12 flex flex-col gap-3 reveal">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Experience
            </span>
            <h2 className="heading-display text-4xl sm:text-5xl">
              Where I&apos;ve worked
            </h2>
          </div>
          <ExperienceTimeline experiences={experiences} />
        </section>
      ) : null}

      <HowIBuild />

      <section
        id="skills"
        tabIndex={-1}
        className="section-anchor relative"
      >
        <CoreStack />
      </section>

      {sections.showAbout ? (
        <AboutSection
          identity={identity}
          stats={stats}
          education={education}
        />
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
