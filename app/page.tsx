import { Suspense } from 'react';
import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
import { Hero } from '@/components/site/Hero';
import { ImpactMetrics } from '@/components/site/ImpactMetrics';
import { AboutMe } from '@/components/site/AboutMe';
import { ToolsAndTechnologies } from '@/components/site/ToolsAndTechnologies';
import { SelectedProjects } from '@/components/site/SelectedProjects';
import { ExperienceTimeline } from '@/components/site/ExperienceTimeline';
import { Recommendations } from '@/components/site/Recommendations';
import { AiDrivenQa } from '@/components/site/AiDrivenQa';
import { Industries } from '@/components/site/Industries';
import { CertificationsAndEducation } from '@/components/site/CertificationsAndEducation';
import { ContactCta } from '@/components/site/ContactCta';
import { ContactFormSection } from '@/components/site/ContactFormSection';
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

      <ImpactMetrics />

      {sections.showAbout ? <AboutMe identity={identity} /> : null}

      {sections.showSkills ? (
        <section
          id="skills"
          tabIndex={-1}
          className="section-anchor relative"
        >
          <ToolsAndTechnologies />
        </section>
      ) : null}

      <section
        id="work"
        tabIndex={-1}
        className="section-anchor relative bg-bg-2 py-20 sm:py-28"
      >
        <Suspense fallback={null}>
          <SelectedProjects limit={3} />
        </Suspense>
      </section>

      {sections.showExperience ? (
        <section
          id="experience"
          tabIndex={-1}
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="mb-12 flex flex-col gap-3 reveal">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              Career Journey
            </span>
            <h2 className="heading-display heading-underline text-4xl sm:text-5xl">
              My Professional Experience
            </h2>
          </div>
          <ExperienceTimeline experiences={experiences} />
        </section>
      ) : null}

      <section
        id="recommendations"
        tabIndex={-1}
        className="section-anchor relative bg-bg-2 py-20 sm:py-28"
      >
        <Recommendations linkedin={identity.socialLinkedin} />
      </section>

      <AiDrivenQa />

      <section
        id="industries"
        tabIndex={-1}
        className="section-anchor relative py-16 sm:py-20"
      >
        <Industries />
      </section>

      <section
        id="certifications"
        tabIndex={-1}
        className="section-anchor relative bg-bg-2 py-20 sm:py-28"
      >
        <CertificationsAndEducation education={education} />
      </section>

      <ContactCta identity={identity} />

      <ContactFormSection />

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
