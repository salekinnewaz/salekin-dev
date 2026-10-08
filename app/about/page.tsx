import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries/site';
import { env } from '@/lib/env';

/**
 * About — standalone page. Strongest possible surface for the
 * "Md Salekin Newaz" name query: h1 is the full name, every section
 * reinforces it, JSON-LD connects this page back to the global #person
 * entity so the knowledge graph stays intact.
 *
 * This page is INTENTIONALLY light on design (no illustrations, no big
 * cards) so it loads fast, has a very high text-to-markup ratio, and
 * surfaces the name in plain HTML for crawlers.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { identity } = await getSiteSettings();
  const siteUrl = env.SITE_URL ?? 'https://salekin-dev.vercel.app';
  return {
    title: `About ${identity.siteTitle} — Senior Software QA Engineer`,
    description: `Learn about ${identity.siteTitle} — ISTQB® Certified Senior Software QA Engineer at Brain Station 23, specializing in Playwright automation, AI-driven QA, and CI/CD integration.`,
    alternates: {
      canonical: `${siteUrl}/about`,
    },
    openGraph: {
      type: 'profile',
      title: `About ${identity.siteTitle}`,
      description: `Learn about ${identity.siteTitle} — ISTQB® Certified Senior Software QA Engineer at Brain Station 23.`,
      url: `${siteUrl}/about`,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `About ${identity.siteTitle}`,
        },
      ],
    },
  };
}

export default async function AboutPage() {
  const { identity } = await getSiteSettings();
  const siteUrl = env.SITE_URL ?? 'https://salekin-dev.vercel.app';

  // Build the bio paragraph list. Lead with a "Hi, I'm …" sentence so
  // the name appears in the first sentence of the body — search engines
  // weight the first sentence of a page's body.
  const greeting = `Hi, I'm ${identity.siteTitle}.`;
  const bioParagraphs = identity.aboutBio
    ? identity.aboutBio.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [];
  const paragraphs = [greeting, ...bioParagraphs];

  // WebPage JSON-LD specific to /about. Connects to the global #person
  // and #website entities declared in the root layout.
  const webPageJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${siteUrl}/about#webpage`,
    url: `${siteUrl}/about`,
    name: `About ${identity.siteTitle}`,
    inLanguage: 'en',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#person` },
    description: `About ${identity.siteTitle} — Senior Software QA Engineer at Brain Station 23, ISTQB® Certified, specializing in Playwright automation and AI-driven QA.`,
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <header className="mb-12 flex flex-col gap-4">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          About
        </span>
        <h1
          className="heading-display heading-gradient text-4xl sm:text-5xl lg:text-6xl"
          data-testid="about-h1"
        >
          {identity.siteTitle}
        </h1>
        <p className="font-mono text-sm uppercase tracking-widest text-fg-2 sm:text-base">
          Senior Software QA Engineer · ISTQB® Certified · Brain Station 23
        </p>
        {identity.contactLocation ? (
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Based in {identity.contactLocation}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-5" data-testid="about-bio">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-base leading-relaxed text-fg-2 sm:text-lg text-pretty"
          >
            {p}
          </p>
        ))}
      </div>

      <section className="mt-14 flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          At a glance
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Role
            </dt>
            <dd className="mt-1 text-fg">Senior Software QA Engineer</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Company
            </dt>
            <dd className="mt-1 text-fg">Brain Station 23</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Certification
            </dt>
            <dd className="mt-1 text-fg">ISTQB® Foundation Level</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Specialties
            </dt>
            <dd className="mt-1 text-fg">
              Playwright · AI-driven QA · API testing · CI/CD
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-12 flex flex-col gap-4 border-t border-border pt-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Find {identity.siteTitle} elsewhere
        </h2>
        <ul className="flex flex-wrap gap-3" data-testid="about-socials">
          {identity.socialGithub ? (
            <li>
              <a
                href={identity.socialGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline magnetic"
              >
                GitHub
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ) : null}
          {identity.socialLinkedin ? (
            <li>
              <a
                href={identity.socialLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline magnetic"
              >
                LinkedIn
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ) : null}
          {identity.contactEmail ? (
            <li>
              <a
                href={`mailto:${identity.contactEmail}`}
                className="btn-outline magnetic"
              >
                {identity.contactEmail}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ) : null}
          <li>
            <Link href="/cv-download" className="btn-outline magnetic">
              Download CV
              <span aria-hidden="true">↓</span>
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-14 text-sm text-muted">
        Continue to{' '}
        <Link href="/#work" className="text-accent hover:underline">
          featured work
        </Link>
        ,{' '}
        <Link href="/#experience" className="text-accent hover:underline">
          experience
        </Link>
        , or{' '}
        <Link href="/#contact" className="text-accent hover:underline">
          get in touch
        </Link>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </article>
  );
}
