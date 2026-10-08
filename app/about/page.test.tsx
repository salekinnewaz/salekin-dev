// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/link so we don't need a router in unit tests.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock the site settings query so the test doesn't need a real DB.
vi.mock('@/lib/queries/site', () => ({
  getSiteSettings: vi.fn(async () => ({
    identity: {
      siteTitle: 'Md Salekin Newaz',
      contactEmail: 'salekin@example.com',
      contactLocation: 'Dhaka, Bangladesh',
      socialGithub: 'https://github.com/salekin',
      socialLinkedin: 'https://linkedin.com/in/salekin',
      aboutBio:
        'First paragraph of bio.\n\nSecond paragraph of bio with more detail.',
    },
  })),
}));

vi.mock('@/lib/env', () => ({
  env: { SITE_URL: 'https://salekin-dev.vercel.app' },
}));

import AboutPage from './page';

describe('AboutPage (standalone)', () => {
  beforeEach(() => {
    // Silence the JSON-LD script — testing-library can't traverse it as HTML anyway.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const first = args[0];
      if (typeof first === 'string' && first.includes('script')) return;
      origWarn(...args);
    };
  });

  it('renders the full name as the h1', async () => {
    const element = await AboutPage();
    render(element);
    const h1 = await screen.findByTestId('about-h1');
    expect(h1).toHaveTextContent('Md Salekin Newaz');
  });

  it('leads the bio with a greeting that names the person', async () => {
    const element = await AboutPage();
    render(element);
    const bio = await screen.findByTestId('about-bio');
    expect(bio).toHaveTextContent("Hi, I'm Md Salekin Newaz.");
  });

  it('includes every bio paragraph from the identity record', async () => {
    const element = await AboutPage();
    render(element);
    const bio = await screen.findByTestId('about-bio');
    expect(bio).toHaveTextContent('First paragraph of bio.');
    expect(bio).toHaveTextContent('Second paragraph of bio with more detail.');
  });

  it('exposes social links so search engines can find them', async () => {
    const element = await AboutPage();
    render(element);
    const socials = await screen.findByTestId('about-socials');
    expect(socials).toHaveTextContent('GitHub');
    expect(socials).toHaveTextContent('LinkedIn');
    expect(socials).toHaveTextContent('Download CV');
    expect(socials.querySelector('a[href="https://github.com/salekin"]')).not.toBeNull();
    expect(socials.querySelector('a[href="https://linkedin.com/in/salekin"]')).not.toBeNull();
    expect(socials.querySelector('a[href="mailto:salekin@example.com"]')).not.toBeNull();
  });

  it('links back to the home page sections for further reading', async () => {
    const element = await AboutPage();
    render(element);
    expect(screen.getByRole('link', { name: /featured work/i }).getAttribute('href')).toBe(
      '/#work',
    );
    expect(screen.getByRole('link', { name: /experience/i }).getAttribute('href')).toBe(
      '/#experience',
    );
    expect(screen.getByRole('link', { name: /get in touch/i }).getAttribute('href')).toBe(
      '/#contact',
    );
  });
});
