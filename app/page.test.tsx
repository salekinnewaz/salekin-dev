// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
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
import HomePage from './page';

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

const allSections = {
  showHero: true,
  showAbout: true,
  showExperience: true,
  showSkills: true,
  showEducation: true,
  showContact: true,
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

const profileImageBase = {
  dataUri: null,
  position: '50% 30%',
  version: '0',
  hasAlpha: true,
  mode: 'cutout' as const,
  hasCustomImage: false,
};

const availabilityBase = {
  availableForWork: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listExperiencesOrdered).mockResolvedValue([]);
  vi.mocked(listEducationOrdered).mockResolvedValue([]);
  vi.mocked(getSiteSettings).mockResolvedValue({
    identity: identityBase,
    sections: allSections,
    availability: availabilityBase,
    theme: themeBase,
    skills: skillsBase,
    stats: statsBase,
    profileImage: profileImageBase,
  });
});

/**
 * Render the home page output inside a Suspense boundary so any
 * streaming async sections resolve before assertions run.
 */
async function renderHomePage(ui: React.ReactElement) {
  await act(async () => {
    render(<Suspense fallback={null}>{ui}</Suspense>);
  });
}

describe('HomePage', () => {
  it('renders the hero heading and positioning copy', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /build, test and ship reliable software/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Senior Software QA Engineer/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/across the full SDLC/i).length).toBeGreaterThan(
      0,
    );
  });

  it('renders all six numbered modules', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /software quality, development & delivery/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /open source and client engagements/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /written from the work/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /where the work happened/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /what colleagues and clients say/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /book a consultation/i }),
    ).toBeInTheDocument();
  });

  it('renders every section anchor the floating navbar links to', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    for (const id of [
      'hero',
      'services',
      'work',
      'blog',
      'experience',
      'reviews',
      'contact',
    ]) {
      const el = document.getElementById(id);
      expect(el, `missing #${id}`).not.toBeNull();
    }
  });

  it('renders the four credibility metrics from the verified CV', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(screen.getByText('5+')).toBeInTheDocument();
    expect(screen.getByText(/Years in QA/i)).toBeInTheDocument();
    // Scope to the hero's metric list — "Production Releases" also
    // appears in the experience section copy.
    const heroMetrics = document.querySelector('#hero dl') as HTMLElement;
    expect(heroMetrics).not.toBeNull();
    expect(
      within(heroMetrics).getByText(/Production Releases/i),
    ).toBeInTheDocument();
    expect(screen.getByText('435+')).toBeInTheDocument();
    expect(screen.getByText(/npm Downloads/i)).toBeInTheDocument();
    // The package name is a real link to the npm registry, and it
    // opens in a new tab without leaking the referrer.
    const pkgLink = within(heroMetrics).getByRole('link', {
      name: /playwright-summary-reporter/i,
    });
    expect(pkgLink.getAttribute('href')).toBe(
      'https://www.npmjs.com/package/playwright-summary-reporter?activeTab=versions',
    );
    expect(pkgLink.getAttribute('target')).toBe('_blank');
    expect(pkgLink.getAttribute('rel')).toContain('noopener');
    expect(
      within(heroMetrics).getByText(/Open Source Contributor/i),
    ).toBeInTheDocument();
  });

  it('renders the six service capabilities with their learn-more buttons', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    const buttons = screen.getAllByRole('button', { name: /learn more/i });
    expect(buttons.length).toBe(6);
    expect(
      screen.getByText('Test Automation & Quality Engineering'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('End-to-End Software Delivery'),
    ).toBeInTheDocument();
  });

  it('renders the lifecycle strip, process steps and engagement models', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    // The hero's QA Pipeline also renders "Build", "Test" and "Release",
    // so scope the lifecycle-strip assertions to the Services section.
    const services = document.getElementById('services') as HTMLElement;
    expect(services).not.toBeNull();
    for (const label of ['Build', 'Test', 'Automate', 'Release', 'Support']) {
      expect(
        within(services).getByText(label),
      ).toBeInTheDocument();
    }
    expect(screen.getByText('How I Work')).toBeInTheDocument();
    expect(screen.getByText('Ways to Collaborate')).toBeInTheDocument();
    expect(screen.getByText('Project Delivery')).toBeInTheDocument();
    expect(screen.getByText('Ongoing Support')).toBeInTheDocument();
  });

  it('renders the three case studies with their read buttons', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    const buttons = screen.getAllByRole('button', { name: /read case study/i });
    expect(buttons.length).toBe(3);
  });

  it('renders the open-source spotlight install command', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(
      screen.getByText('npm i -D playwright-summary-reporter'),
    ).toBeInTheDocument();
  });

  it('renders the four engineering notes', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    const buttons = screen.getAllByRole('button', { name: /read article/i });
    expect(buttons.length).toBe(4);
  });

  it('renders the career timeline with the current role expanded', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(
      screen.getByRole('button', { name: /Senior Software QA Engineer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Jan 2025 — Present/)).toBeInTheDocument();
  });

  it('renders the verified credentials', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(
      screen.getByText(/ISTQB® Certified Tester — Foundation Level/),
    ).toBeInTheDocument();
    expect(screen.getByText(/AWS Cloud Foundations/)).toBeInTheDocument();
  });

  it('renders the three featured endorsements and hides the rest', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(screen.getByText('Herman Kulild Dragesund')).toBeInTheDocument();
    expect(screen.getByText('Junaid Aziz')).toBeInTheDocument();
    expect(screen.getByText('Shahriar Morshed')).toBeInTheDocument();
    expect(screen.queryByText('S.B.M Reazul Karim')).toBeNull();
    expect(
      screen.getByRole('button', { name: /\+ show 2 more endorsements/i }),
    ).toBeInTheDocument();
  });

  it('renders the contact form with the five service pills', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    // Scope to the contact section: the blog category tabs reuse some
    // of the same labels ("AI-Driven QA").
    const contact = document.getElementById('contact');
    expect(contact).not.toBeNull();
    const pills = Array.from(
      contact!.querySelectorAll('button[aria-pressed]'),
    ).map((b) => b.textContent?.trim());
    expect(pills).toEqual([
      'Playwright Automation',
      'AI-Driven QA',
      'API & Load Testing',
      'Release Audit / QA Lead',
      'General / Mentoring',
    ]);
  });

  it('renders the verified email, phone and Dhaka clock label', async () => {
    const ui = await HomePage();
    await renderHomePage(ui);
    expect(
      screen.getAllByText('salekinnewaz0@gmail.com').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('+880 1640-8369595').length).toBeGreaterThan(0);
    expect(screen.getByText(/Dhaka, BD · UTC\+6/)).toBeInTheDocument();
  });
});
