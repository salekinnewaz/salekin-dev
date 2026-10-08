// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/queries/site', () => ({
  getSiteSettings: vi.fn(),
}));
vi.mock('@/lib/queries/experiences', () => ({
  listExperiencesOrdered: vi.fn(),
}));
vi.mock('@/lib/queries/education', () => ({
  listEducationOrdered: vi.fn(),
}));

import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
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

const themeBase = {
  accentColor: '#a78bfa',
  accentColor2: '#22d3ee',
  defaultTheme: 'dark' as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listExperiencesOrdered).mockResolvedValue([]);
  vi.mocked(listEducationOrdered).mockResolvedValue([]);
});

describe('HomePage', () => {
  it('renders hero with site title', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
    });
    const ui = await HomePage();
    render(ui);
    // Heading might split into 2 spans (first name + last name)
    expect(
      screen.getByRole('heading', { level: 1, name: /Salekin Newaz/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Web developer/i)).toBeInTheDocument();
  });

  it('renders all major sections when enabled', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
    });
    const ui = await HomePage();
    render(ui);
    // Section headings (h2)
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
      screen.getByRole('heading', { level: 2, name: /curl/i }),
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
    });
    const ui = await HomePage();
    render(ui);
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('renders the experience timeline with a row per experience', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue({
      identity: identityBase,
      sections: allSections,
      theme: themeBase,
      skills: skillsBase,
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
    render(ui);
    expect(screen.getByText('Jr. Engineer')).toBeInTheDocument();
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
    render(ui);
    expect(screen.getByText('BSc')).toBeInTheDocument();
    expect(screen.getByText('DIU')).toBeInTheDocument();
  });
});