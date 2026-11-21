import { Hero } from '@/components/site/Hero';
import { ServicesSection } from '@/components/site/ServicesSection';
import { WorkSection } from '@/components/site/WorkSection';
import { BlogSection } from '@/components/site/BlogSection';
import { ExperienceSection } from '@/components/site/ExperienceSection';
import { ReviewsSection } from '@/components/site/ReviewsSection';
import { ContactSection } from '@/components/site/ContactSection';
import { getSiteSettings } from '@/lib/queries/site';
import { env } from '@/lib/env';

// The home page reads the admin-managed portrait from the database on
// every request, so it must not be statically prerendered — otherwise
// the `version` cache-busting token would be frozen at build time and a
// newly uploaded image would not appear until a redeploy.
//
// `revalidatePath('/')` in the upload action still refreshes the
// route cache, so this stays a fast, ISR-friendly render rather than a
// full dynamic one where possible.
export const dynamic = 'force-dynamic';

// SEO: the home page intentionally does NOT set its own `title` so the
// root layout's strong default ("Md Salekin Newaz — Senior Software QA
// Engineer") renders. Adding `title: 'Home'` here would override the
// template to "Home · Md Salekin Newaz" — a generic string that wastes
// the most important on-page keyword slot for the user's name query.

export default async function HomePage() {
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';

  // The portrait is admin-managed and persisted in the database. Read
  // it here so the Hero renders the active image on the server — no
  // flash of the default portrait, no hardcoded reference in the
  // component, and no redeploy required after an upload.
  const site = await getSiteSettings();

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
      <Hero
        profileImage={{
          src: site.profileImage.dataUri ? '/profile-image' : '/images/profile.jpg',
          position: site.profileImage.position,
          version: site.profileImage.version,
        }}
      />
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
