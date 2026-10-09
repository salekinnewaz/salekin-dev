import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { Logo } from './Logo';

type SiteFooterProps = {
  identity: SiteIdentity;
};

const NAV: Array<{ href: string; label: string }> = [
  { href: '/#work', label: 'Work' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#recommendations', label: 'Recommendations' },
  { href: '/#skills', label: 'Stack' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

/**
 * SiteFooter — site-wide footer.
 *
 * Per the v3 brief: thin top border, no glow, single row on desktop
 * (logo + name on the left, nav in the middle, social icons on the
 * right), stacked on mobile. Sits at the bottom of every page.
 */
export function SiteFooter({ identity }: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-16">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-fg no-underline"
          >
            <Logo variant="mark" className="h-7 w-7" />
            <span className="font-mono text-sm font-semibold tracking-wide">
              salekin-dev
            </span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="transition-colors hover:text-accent"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-2">
            {identity.socialGithub ? (
              <li>
                <a
                  href={identity.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.1-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                </a>
              </li>
            ) : null}
            {identity.socialLinkedin ? (
              <li>
                <a
                  href={identity.socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V10.5H5.67v7.84h2.67zm-1.34-9c.85 0 1.54-.7 1.54-1.55a1.54 1.54 0 1 0-3.08 0c0 .85.69 1.55 1.54 1.55zm11.34 9v-4.59c0-2.19-.45-3.84-3-3.84-1.21 0-2.03.66-2.37 1.3h-.04V10.5h-2.55v7.84h2.66v-3.88c0-1.02.2-2 1.46-2s1.27 1.16 1.27 2.07v3.81h2.57z" />
                  </svg>
                </a>
              </li>
            ) : null}
            {identity.contactEmail ? (
              <li>
                <a
                  href={`mailto:${identity.contactEmail}`}
                  aria-label="Email"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <p className="text-xs text-muted">
          © {year} {identity.siteTitle}. All rights reserved. Built
          with care.
        </p>
      </div>
    </footer>
  );
}
