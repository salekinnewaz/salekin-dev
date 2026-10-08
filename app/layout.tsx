import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Header } from '@/components/site/Header';
import { BackgroundLayers } from '@/components/site/BackgroundLayers';
import { SideNav } from '@/components/site/SideNav';
import { RevealObserver } from '@/components/site/RevealObserver';
import { TerminalEasterEgg } from '@/components/site/TerminalEasterEgg';
import { HashScrollController } from '@/components/site/HashScrollController';
import { getSiteSettings } from '@/lib/queries/site';
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
        url: '/og',
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
    images: ['/og'],
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
  const { theme, identity } = await getSiteSettings();

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

  // JSON-LD Person schema for SEO
  const siteUrl = env.SITE_URL ?? 'http://localhost:3000';
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.siteTitle,
    jobTitle: identity.siteTagline,
    email: identity.contactEmail ?? undefined,
    address: identity.contactLocation ?? undefined,
    url: siteUrl,
    image: `${siteUrl}/og`,
    sameAs: [
      identity.socialGithub,
      identity.socialLinkedin,
      identity.socialFacebook,
      identity.socialX,
    ].filter((x): x is string => Boolean(x)),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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