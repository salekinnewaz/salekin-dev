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
  siteTitle: 'Md Salekin Newaz',
  siteTagline:
    'Building quality infrastructure that enables engineering teams to release with confidence.',
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
      screen.getByRole('heading', { level: 1, name: /Md Salekin Newaz/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/quality infrastructure/i)).toBeInTheDocument();
    // New role strap element (also surfaces in the Current Role section,
    // so use getAllByText).
    expect(screen.getAllByText(/Senior Software QA Engineer/i).length).toBeGreaterThan(0);
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
    // Provide a current experience so the Current Role section renders
    // its heading (it returns null when there's no endDate === null row).
    vi.mocked(listExperiencesOrdered).mockResolvedValue([
      {
        id: 'e1',
        company: 'Brain Station 23',
        role: 'Senior Software QA Engineer',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: null,
        description: 'Lead QA.',
        bullets: [],
        sortOrder: 1,
      },
    ]);
    const ui = await HomePage();
    await renderHomePage(ui);
    // Section headings (h2) — plain editorial labels, no terminal
    // prefixes. The on-page sections (per brief §24): Current Role,
    // Featured Work, Experience, How I Build, Core Expertise,
    // AI-Driven QA, About, Education & Certifications, Contact. Plus
    // the h1 in the Hero.
    expect(
      screen.getByRole('heading', { level: 2, name: /what i.?m doing now/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /featured work/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /where i.{0,3}ve worked/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /how i build/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /core expertise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /ai.?driven qa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /a bit about me/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /education .{0,3} certifications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /let.?s build something/i }),
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
        company: 'Brain Station 23',
        role: 'Senior Software QA Engineer',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: null,
        description: 'Lead QA across products.',
        bullets: ['Built Playwright framework', 'Set up CI/CD', 'Mentored juniors'],
        sortOrder: 1,
      },
      {
        id: 'e2',
        company: 'SEBPO',
        role: 'Trainee QA Engineer',
        startDate: new Date('2021-11-01T00:00:00Z'),
        endDate: new Date('2021-12-31T00:00:00Z'),
        description: 'Foundation training.',
        bullets: [],
        sortOrder: 2,
      },
    ]);
    const ui = await HomePage();
    await renderHomePage(ui);
    // Company + role + bullets all render in the timeline. The current
    // role row also gets surfaced in the dedicated Current Role section
    // above the timeline, so substring matchers stay robust to either
    // placement.
    expect(screen.getAllByText(/Brain Station 23/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Senior Software QA Engineer/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Built Playwright framework')).toBeInTheDocument();
    expect(screen.getByText('Foundation training.')).toBeInTheDocument();
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
        institution: 'International Islamic University Chittagong',
        degree: 'BSc in Computer Science & Engineering',
        startYear: 2016,
        endYear: 2020,
        description: null,
        sortOrder: 1,
      },
    ]);
    const ui = await HomePage();
    await renderHomePage(ui);
    // BSc / institution should appear at least once on the page. The
    // education row now lives in its own Education & Certifications
    // section (per brief §24), not inside About. Substring matchers
    // keep the test robust to either placement.
    expect(screen.getAllByText(/B\.?Sc/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/IIUC|Chittagong/i).length).toBeGreaterThan(0);
  });
});
