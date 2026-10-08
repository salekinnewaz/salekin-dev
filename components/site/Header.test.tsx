// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

import { Header } from './Header';

vi.mock('@/lib/queries/site', () => ({
  getSiteSettings: vi.fn().mockResolvedValue({
    identity: {
      siteTitle: 'Test Site',
      siteTagline: 'tag',
      siteSubtitle: '',
      siteInitials: 'TS',
      aboutBio: '',
      contactEmail: 'hi@example.com',
      contactPhone: null,
      contactLocation: null,
      cvUrl: '/cv.pdf',
      socialGithub: null,
      socialLinkedin: null,
      socialFacebook: null,
      socialX: null,
    },
    sections: {
      showHero: true,
      showAbout: true,
      showExperience: true,
      showSkills: true,
      showEducation: true,
      showContact: true,
    },
    theme: {
      accentColor: '#a78bfa',
      accentColor2: '#22d3ee',
      defaultTheme: 'dark' as const,
    },
    skills: { languages: [], frameworks: [], databases: [], tools: [], soft: [] },
    stats: { yearsCoding: 4, sitesShipped: 24, rolesHeld: 5 },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Header', () => {
  it('renders the site title from settings as the brand', async () => {
    const ui = await Header();
    render(ui);
    expect(screen.getByText('Test Site')).toBeInTheDocument();
  });

  it('renders the brand link pointing to "/"', async () => {
    const ui = await Header();
    render(ui);
    const brand = screen.getByText('Test Site').closest('a');
    expect(brand).toHaveAttribute('href', '/');
  });

  it('renders a section nav link to #contact inside the header', async () => {
    const ui = await Header();
    render(ui);
    // Contact is always rendered (showContact is true by default in fixtures).
    const links = screen.getAllByRole('link', { name: /contact/i });
    expect(links.some((a) => a.getAttribute('href') === '#contact')).toBe(true);
  });

  it('renders an admin pill', async () => {
    const ui = await Header();
    render(ui);
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });

  it('falls back to "salekin.dev" when brand is empty', async () => {
    const { getSiteSettings } = await import('@/lib/queries/site');
    vi.mocked(getSiteSettings).mockResolvedValueOnce({
      identity: {
        siteTitle: '',
        siteTagline: '',
        siteSubtitle: '',
        siteInitials: 'X',
        aboutBio: '',
        contactEmail: null,
        contactPhone: null,
        contactLocation: null,
        cvUrl: '/cv.pdf',
        socialGithub: null,
        socialLinkedin: null,
        socialFacebook: null,
        socialX: null,
      },
      sections: {
        showHero: true,
        showAbout: true,
        showExperience: true,
        showSkills: true,
        showEducation: true,
        showContact: true,
      },
      theme: {
        accentColor: '#a78bfa',
        accentColor2: '#22d3ee',
        defaultTheme: 'dark' as const,
      },
      skills: { languages: [], frameworks: [], databases: [], tools: [], soft: [] },
      stats: { yearsCoding: 4, sitesShipped: 24, rolesHeld: 5 },
    });
    const ui = await Header();
    render(ui);
    expect(screen.getByText('salekin.dev')).toBeInTheDocument();
  });

  it('renders the theme toggle button', async () => {
    const ui = await Header();
    render(ui);
    expect(
      screen.getByRole('button', { name: /theme:/i }),
    ).toBeInTheDocument();
  });
});