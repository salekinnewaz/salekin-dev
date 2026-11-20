import { Hero } from '@/components/site/Hero';
import { ServicesSection } from '@/components/site/ServicesSection';
import { WorkSection } from '@/components/site/WorkSection';
import { BlogSection } from '@/components/site/BlogSection';
import { ExperienceSection } from '@/components/site/ExperienceSection';
import { ReviewsSection } from '@/components/site/ReviewsSection';
import { ContactSection } from '@/components/site/ContactSection';
import { env } from '@/lib/env';

// SEO: the home page intentionally does NOT set its own `title` so the
// root layout's strong default ("Md Salekin Newaz — Senior Software QA
// Engineer") renders. Adding `title: 'Home'` here would override the
// template to "Home · Md Salekin Newaz" — a generic string that wastes
// the most important on-page keyword slot for the user's name query.

export default async function HomePage() {
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
    name: 'Md Salekin Newaz — Senior Software QA Engineer',
    inLanguage: 'en',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#person` },
    description:
      'Portfolio of Md Salekin Newaz — Senior Software QA Engineer at Brain Station 23, ISTQB® Certified, specializing in Playwright automation and AI-driven QA.',
  };

  return (
    <div className="flex flex-col">
      <Hero />
      <ServicesSection />
      <WorkSection />
      <BlogSection />
      <ExperienceSection />
      <ReviewsSection />
      <ContactSection />

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
