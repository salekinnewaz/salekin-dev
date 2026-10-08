// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Suspense } from 'react';

vi.mock('@/lib/queries/site', () => ({
  getSiteSettings: vi.fn(),
}));
vi.mock('@/lib/queries/experiences', () => ({
  listExperiencesOrdered: vi.fn(),
}));
vi.mock('@/lib/queries/education', () => ({
  listEducationOrdered: vi.fn(),
}));
vi.mock('@/lib/queries/projects', () => ({
  getHomepageProjects: vi.fn().mockResolvedValue([]),
  getFeaturedProjects: vi.fn().mockResolvedValue([]),
  listPublishedProjects: vi.fn().mockResolvedValue([]),
}));

import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
import { getHomepageProjects } from '@/lib/queries/projects';
import HomePage from './page';

const allSections = {
  showHero: true,
  showAbout: true,
  showExperience: true,
  showSkills: true,
  showEducation: true,
  showContact: true,
};

const identityBase = {
  siteTitle: 'Salekin Newaz',
  siteTagline: 'Web developer.',
  siteSubtitle: '',
  siteInitials: 'SN',
  aboutBio: '',
  contactEmail: 'me@example.com',
  contactPhone: null,
  contactLocation: 'Dhaka',
  cvUrl: '/cv.pdf',
  socialGithub: null,
  socialLinkedin: null,
  socialFacebook: null,
  socialX: null,
};

const skillsBase = {
  languages: [],
  frameworks: [],
  databases: [],
  tools: [],
  soft: [],
};

const statsBase = {
  yearsCoding: 4,
  sitesShipped: 24,
  rolesHeld: 5,
};

const themeBase = {
  accentColor: '#a78bfa',
  accentColor2: '#22d3ee',
  defaultTheme: 'dark' as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listExperiencesOrdered).mockResolvedValue([]);
  vi.mocked(listEducationOrdered).mockResolvedValue([]);
  vi.mocked(getHomepageProjects).mockResolvedValue([]);
});

/**
 * Render the home page output inside a Suspense boundary so the
 * streaming async sections (FeaturedProjects) can resolve. The page
 * component itself already wraps FeaturedProjects in <Suspense>, but
 * the test renderer requires the outer render to also be wrapped in
 * `act` so pending promises settle before assertions run.
 */
async function renderHomePage(ui: React.ReactElement) {
  await act(async () => {
    render(<Suspense fallback={null}>{ui}</Suspense>);
  });
}

describe('HomePage', () => {
  it('renders hero with site title and role strap', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
      stats: statsBase,
    });
    const ui = await HomePage();
    await renderHomePage(ui);
    // Heading might split into 2 spans (first name + last name)
    expect(
      screen.getByRole('heading', { level: 1, name: /Salekin Newaz/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Web developer/i)).toBeInTheDocument();
    // New role strap element
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
  });

  it('renders all major sections when enabled', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
      stats: statsBase,
    });
    // Provide a single featured project so the FeaturedProjects section
    // renders its heading (otherwise it returns null when empty).
    vi.mocked(getHomepageProjects).mockResolvedValue([
      {
        id: 'p1',
        slug: 'specsmd',
        title: 'specsmd',
        description: 'A planning framework.',
        imageUrl: null,
        techStack: ['TypeScript'],
        publishedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ]);
    const ui = await HomePage();
    await renderHomePage(ui);
    // Section headings (h2) — order-independent matches
    expect(
      screen.getByRole('heading', { level: 2, name: /whoami/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /career\.log/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /tech.*tool.*skill/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /\bman\b.*salekin/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /open/i }),
    ).toBeInTheDocument(); // contact section
    // New sections introduced by the upgrade
    expect(
      screen.getByRole('heading', { level: 2, name: /featured/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /now/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /principles/i }),
    ).toBeInTheDocument();
  });

  it('hides every section when toggles are off', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: {
        showHero: false,
        showAbout: false,
        showExperience: false,
        showSkills: false,
        showEducation: false,
        showContact: false,
      },
      theme: themeBase,
      skills: skillsBase,
      stats: statsBase,
    });
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('renders the experience timeline with a row per experience', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
      stats: statsBase,
    });
    vi.mocked(listExperiencesOrdered).mockResolvedValue([
      {
        id: 'e1',
        company: 'Braintree',
        role: 'Jr. Engineer',
        startDate: new Date('2025-09-01T00:00:00Z'),
        endDate: null,
        description: 'Building tools.',
        bullets: ['Shipped A', 'Shipped B'],
        sortOrder: 1,
      },
      {
        id: 'e2',
        company: 'StackRefactor',
        role: 'Full-Stack',
        startDate: new Date('2024-08-01T00:00:00Z'),
        endDate: new Date('2024-12-31T00:00:00Z'),
        description: 'Built inventory.',
        bullets: [],
        sortOrder: 2,
      },
    ]);
    const ui = await HomePage();
    await renderHomePage(ui);
    // "Jr. Engineer" also appears in CurrentlyBuildingSection's current
    // role card — use getAllByText to assert presence, not uniqueness.
    expect(screen.getAllByText('Jr. Engineer').length).toBeGreaterThan(0);
    expect(screen.getByText('Full-Stack')).toBeInTheDocument();
    expect(screen.getByText('Shipped A')).toBeInTheDocument();
    expect(screen.getByText('Built inventory.')).toBeInTheDocument();
  });

  it('renders the education list with one row per entry', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
      stats: statsBase,
    });
    vi.mocked(listEducationOrdered).mockResolvedValue([
      {
        id: 'ed1',
        institution: 'DIU',
        degree: 'BSc',
        startYear: 2022,
        endYear: 2025,
        description: null,
        sortOrder: 1,
      },
    ]);
    const ui = await HomePage();
    await renderHomePage(ui);
    // BSc/DIU should appear at least once on the page.
    expect(screen.getAllByText('BSc').length).toBeGreaterThan(0);
    expect(screen.getAllByText('DIU').length).toBeGreaterThan(0);
  });
});
