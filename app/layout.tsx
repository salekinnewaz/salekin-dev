import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Header } from '@/components/site/Header';
import { BackgroundLayers } from '@/components/site/BackgroundLayers';
import { SideNav } from '@/components/site/SideNav';
import { RevealObserver } from '@/components/site/RevealObserver';
import { TerminalEasterEgg } from '@/components/site/TerminalEasterEgg';
import { HashScrollController } from '@/components/site/HashScrollController';
import { MotionDebug } from '@/components/site/MotionDebug';
import { getSiteSettings } from '@/lib/queries/site';
import { listEducationOrdered } from '@/lib/queries/education';
import { env } from '@/lib/env';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#07070a' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL ?? 'http://localhost:3000'),
  alternates: {
    canonical: new URL(env.SITE_URL ?? 'http://localhost:3000'),
  },
  title: {
    default: 'Md Salekin Newaz — Senior Software QA Engineer',
    template: '%s · Md Salekin Newaz',
  },
  description:
    'Senior Software QA Engineer and ISTQB® Certified professional at Brain Station 23. Playwright automation, AI-driven QA, API and performance testing, CI/CD integration.',
  applicationName: 'Md Salekin Newaz',
  authors: [{ name: 'Md Salekin Newaz' }],
  keywords: [
    'Md Salekin Newaz',
    'Salekin Newaz',
    'Senior Software QA Engineer',
    'Playwright',
    'AI-driven QA',
    'ISTQB',
    'Brain Station 23',
    'test automation',
    'API testing',
    'performance testing',
    'CI/CD',
    'portfolio',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Md Salekin Newaz',
    title: 'Md Salekin Newaz — Senior Software QA Engineer',
    description:
      'Senior Software QA Engineer and ISTQB® Certified professional at Brain Station 23. Playwright automation, AI-driven QA, API and performance testing, CI/CD integration.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Md Salekin Newaz — Senior Software QA Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Md Salekin Newaz — Senior Software QA Engineer',
    description:
      'Senior Software QA Engineer and ISTQB® Certified professional at Brain Station 23. Playwright automation, AI-driven QA, API and performance testing, CI/CD integration.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const [{ theme, identity }, education] = await Promise.all([
    getSiteSettings(),
    listEducationOrdered(),
  ]);

  // Convert hex (#rrggbb) to "rgba(r, g, b, 0.12)" for the soft tint
  const accentRgb = hexToRgb(theme.accentColor);
  const accentRgb2 = hexToRgb(theme.accentColor2);
  const accentSoft = accentRgb
    ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.14)`
    : undefined;

  // Theme-init runs synchronously in <head> to set data-theme before paint,
  // preventing FOUC. Reads localStorage first; falls back to defaultTheme
  // or the OS preference (when defaultTheme is "system").
  // Also adds .js to <html> (so .reveal/.reveal-stagger hide rules activate)
  // and pre-marks any reveal targets already in the viewport so the SSR'd
  // first paint is never blank, even before RevealObserver mounts.
  const themeInitScript = `
    (function() {
      try {
        var stored = localStorage.getItem('theme');
        var pref = ${JSON.stringify(theme.defaultTheme)};
        var resolved;
        if (stored === 'light' || stored === 'dark') {
          resolved = stored;
        } else if (stored === 'system' || (stored == null && pref === 'system')) {
          resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        } else {
          resolved = (pref === 'light' || pref === 'dark') ? pref : 'dark';
        }
        document.documentElement.setAttribute('data-theme', resolved);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      document.documentElement.classList.add('js');
      // Mark already-on-screen reveal targets as shown. Done synchronously
      // so the first paint includes their visible state; the React-driven
      // IntersectionObserver takes over for everything below the fold.
      try {
        var els = document.querySelectorAll('.reveal:not(.is-visible), .reveal-stagger:not(.is-visible)');
        var vh = window.innerHeight || document.documentElement.clientHeight;
        for (var i = 0; i < els.length; i++) {
          var r = els[i].getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) {
            els[i].setAttribute('data-reveal-shown', '');
          }
        }
      } catch (e) { /* IO will handle it */ }
      // Publish the initial active section from the URL hash so the pill
      // nav highlights the right item on first paint (no flash of Home
      // being active when the URL is /#about). The hook module keeps a
      // module-level published value; we mirror it here so the React
      // useState initializer sees the correct value when hydration runs.
      try {
        var hash = window.location.hash.replace(/^#/, '');
        var known = ['hero', 'work', 'about', 'experience', 'skills', 'contact'];
        if (known.indexOf(hash) >= 0) {
          window.__specmdActive = hash;
          window.dispatchEvent(new CustomEvent('specmd:active-section', { detail: hash }));
        }
      } catch (e) { /* ignore */ }
    })();
  `.replace(/\s+/g, ' ').trim();

  // Runtime override — only emit valid hex inputs
  const runtimeCss =
    accentRgb && accentRgb2
      ? `:root{--runtime-accent:${theme.accentColor};--runtime-accent-2:${theme.accentColor2};--runtime-accent-soft:${accentSoft};}`
      : accentRgb
        ? `:root{--runtime-accent:${theme.accentColor};--runtime-accent-soft:${accentSoft};}`
        : '';

  // JSON-LD: Person schema for SEO. Uses schema.org knowledge-graph
  // fields Google surfaces in knowledge panels: knowsAbout, worksFor,
  // alumniOf, jobLocation, sameAs. All values come from real
  // identity / settings / education data — no invented profiles.
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';
  const sameAs = [
    identity.socialGithub,
    identity.socialLinkedin,
    identity.socialFacebook,
    identity.socialX,
  ].filter((x): x is string => Boolean(x));

  // Pick the highest-degree education row for alumniOf. BSc rows
  // (or any row whose degree contains "B" + "Sc" or "Bachelor") are
  // preferred; falls back to the first row if none match.
  const bscLike = education.find((e) => /\b(b\.?sc|bachelor|bs|undergrad)/i.test(e.degree));
  const alumniRow = bscLike ?? education[0];

  const personJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: identity.siteTitle,
    givenName: 'Md Salekin',
    familyName: 'Newaz',
    jobTitle: 'Senior Software QA Engineer',
    description:
      'ISTQB® Certified Senior Software QA Engineer at Brain Station 23, specializing in Playwright automation, AI-driven QA, and CI/CD integration.',
    email: identity.contactEmail ?? undefined,
    address: identity.contactLocation ?? undefined,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    sameAs,
    worksFor: {
      '@type': 'Organization',
      name: 'Brain Station 23',
    },
    knowsAbout: [
      'Test Automation',
      'Playwright',
      'AI-driven QA',
      'Software Testing',
      'API Testing',
      'Performance Testing',
      'CI/CD',
      'ISTQB Foundation Level',
    ],
    ...(identity.contactLocation
      ? {
          jobLocation: {
            '@type': 'Place',
            name: identity.contactLocation,
          },
        }
      : {}),
    ...(alumniRow
      ? {
          alumniOf: {
            '@type': 'EducationalOrganization',
            name: alumniRow.institution,
          },
        }
      : {}),
  };

  // WebSite JSON-LD — declared globally so every page links into the
  // same entity id (`#website`). The per-page WebPage blocks in
  // `app/page.tsx` and project pages set `isPartOf: { '@id': '#website' }`,
  // so the whole site is one connected knowledge graph.
  const websiteJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'salekin.dev',
    url: siteUrl,
    description:
      'Md Salekin Newaz — Senior Software QA Engineer. Portfolio, projects, and case studies.',
    inLanguage: 'en',
    publisher: { '@id': `${siteUrl}/#person` },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        {/* SEO: identity-verification links. `rel="author"` points at the
            canonical about anchor on this site; `rel="me"` is the
            Google-recognized signal that this site is the same person
            as the linked external profile (used for E-E-A-T). */}
        <link rel="author" href={`${siteUrl}/#about`} />
        {/* Google Search Console ownership verification. The user pastes
            the value GSC gives them in `vercel env add
            GOOGLE_SITE_VERIFICATION production`; we render it as a meta
            tag. Only emitted when the env var is set so local/dev builds
            don't ship a stub tag pointing nowhere. */}
        {env.GOOGLE_SITE_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={env.GOOGLE_SITE_VERIFICATION}
          />
        ) : null}
        {identity.socialGithub ? (
          <link rel="me" href={identity.socialGithub} />
        ) : null}
        {identity.socialLinkedin ? (
          <link rel="me" href={identity.socialLinkedin} />
        ) : null}
        {runtimeCss ? (
          <style dangerouslySetInnerHTML={{ __html: runtimeCss }} />
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-fg antialiased">
        <a href="#main" className="skip-link">
          skip to content
        </a>
        <BackgroundLayers />
        <Header />
        <SideNav />
        <RevealObserver />
        <HashScrollController />
        <TerminalEasterEgg />
        <MotionDebug />
        <main
          id="main"
          className="relative mx-auto w-full max-w-6xl flex-1 px-5 pb-20 sm:px-8 lg:px-16"
        >
          {children}
        </main>
        <footer className="relative border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
            <div className="flex items-center gap-2 font-mono text-xs text-muted">
              <span className="text-accent">$</span>
              <span>
                © {new Date().getFullYear()} {identity.siteTitle} · built with care
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
              {identity.contactEmail ? (
                <a
                  href={`mailto:${identity.contactEmail}`}
                  className="hover:text-accent"
                >
                  {identity.contactEmail}
                </a>
              ) : null}
              {identity.socialGithub ? (
                <a
                  href={identity.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  GitHub
                </a>
              ) : null}
              {identity.socialLinkedin ? (
                <a
                  href={identity.socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m || !m[1]) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}