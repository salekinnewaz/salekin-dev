import { Suspense } from 'react';
import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
import { Hero } from '@/components/site/Hero';
import { CurrentRole } from '@/components/site/CurrentRole';
import { FeaturedProjects } from '@/components/site/FeaturedProjects';
import { ExperienceTimeline } from '@/components/site/ExperienceTimeline';
import { Recommendations } from '@/components/site/Recommendations';
import { HowIBuild } from '@/components/site/HowIBuild';
import { CoreStack } from '@/components/site/CoreStack';
import { AiDrivenQa } from '@/components/site/AiDrivenQa';
import { AboutSection } from '@/components/site/AboutSection';
import { EducationCerts } from '@/components/site/EducationCerts';
import { ContactSection } from '@/components/site/ContactSection';
import { env } from '@/lib/env';

// SEO: the home page intentionally does NOT set its own `title` so the
// root layout's strong default ("Md Salekin Newaz — Senior Software QA
// Engineer") renders. Adding `title: 'Home'` here would override the
// template to "Home · Md Salekin Newaz" — a generic string that wastes
// the most important on-page keyword slot for the user's name query.

export default async function HomePage() {
  const [site, experiences, education] = await Promise.all([
    getSiteSettings(),
    listExperiencesOrdered(),
    listEducationOrdered(),
  ]);

  const { identity, sections } = site;
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';

  // WebSite + WebPage JSON-LD for SEO. The Person block is emitted
  // globally in the root layout; here we just link this page into the
  // graph so Google sees the connection (#website → #webpage → #person).
  const websiteJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'salekin.dev',
    url: siteUrl,
    description:
      'Md Salekin Newaz — Senior Software QA Engineer. Portfolio, projects, and case studies.',
  };
  const webPageJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/#webpage`,
    url: siteUrl,
    name: identity.siteTitle,
    inLanguage: 'en',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#person` },
    description:
      'Portfolio of Md Salekin Newaz — Senior Software QA Engineer at Brain Station 23, ISTQB® Certified, specializing in Playwright automation and AI-driven QA.',
  };

  return (
    <div className="flex flex-col">
      {sections.showHero ? <Hero identity={identity} /> : null}

      {sections.showExperience ? (
        <CurrentRole experiences={experiences} />
      ) : null}

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
            <h2 className="heading-display heading-underline text-4xl sm:text-5xl">
              Where I&apos;ve worked
            </h2>
          </div>
          <ExperienceTimeline experiences={experiences} />
        </section>
      ) : null}

      <Recommendations limit={3} />

      <HowIBuild />

      <section
        id="skills"
        tabIndex={-1}
        className="section-anchor relative"
      >
        <CoreStack />
      </section>

      <AiDrivenQa />

      {sections.showAbout ? <AboutSection identity={identity} /> : null}

      {sections.showAbout ? <EducationCerts education={education} /> : null}

      {sections.showContact ? <ContactSection identity={identity} /> : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </div>
  );
}
