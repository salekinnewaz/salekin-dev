import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSiteSettings } from './site';
import { getTestDb } from '../../tests/helpers/db';

// Self-sufficient: each test seeds its own Setting rows so the suite
// doesn't depend on the contents of prisma/seed.ts.

async function wipe() {
  // Wipe all site settings. Other test files in this suite that depend on
  // seed data either seed it themselves or run before this one; if you add
  // a new site test, add the key to the SEED below.
  await getTestDb().setting.deleteMany({});
}

const SEED = {
  site_title: 'Salekin Newaz',
  site_tagline: 'Web developer.',
  site_subtitle: '',
  site_initials: 'SN',
  about_bio: "I'm a web developer who likes building things.",
  contact_email: 'salekinnewaz23@gmail.com',
  contact_phone: '',
  contact_location: '',
  cv_url: '/cv.pdf',
  social_github: 'https://github.com/salekin',
  social_linkedin: '',
  social_facebook: '',
  social_x: '',
  show_hero: 'true',
  show_about: 'true',
  show_experience: 'true',
  show_skills: 'true',
  show_education: 'true',
  show_contact: 'true',
  accent_color: '#a78bfa',
  accent_color_2: '#22d3ee',
  default_theme: 'dark',
  skills: JSON.stringify({
    languages: ['TypeScript', 'JavaScript'],
    frameworks: ['Next.js', 'React'],
    databases: ['PostgreSQL'],
    tools: ['Docker'],
    soft: [],
  }),
  stat_years_coding: '3',
  stat_sites_shipped: '12',
  stat_roles_held: '4',
};

async function seed() {
  for (const [key, value] of Object.entries(SEED)) {
    await getTestDb().setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}

describe('queries/site', () => {
  beforeEach(async () => {
    await wipe();
    await seed();
  });
  afterEach(wipe);

  it('returns typed identity bundle with defaults applied', async () => {
    const settings = await getSiteSettings();
    expect(settings.identity.siteTitle).toBe('Salekin Newaz');
    expect(settings.identity.contactEmail).toBe('salekinnewaz23@gmail.com');
    expect(settings.identity.aboutBio).toContain('web developer');
    expect(settings.identity.socialGithub).toMatch(/^https:\/\/github\.com\//);
    expect(settings.identity.cvUrl).toMatch(/\.pdf$/);
  });

  it('exposes boolean section toggles for every section', async () => {
    const settings = await getSiteSettings();
    expect(settings.sections.showHero).toBe(true);
    expect(settings.sections.showAbout).toBe(true);
    expect(settings.sections.showExperience).toBe(true);
    expect(settings.sections.showSkills).toBe(true);
    expect(settings.sections.showEducation).toBe(true);
    expect(settings.sections.showContact).toBe(true);
  });

  it('exposes theme with default accent and dark default', async () => {
    const settings = await getSiteSettings();
    expect(settings.theme.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(settings.theme.accentColor2).toMatch(/^#[0-9a-f]{6}$/i);
    expect(settings.theme.defaultTheme).toBe('dark');
  });

  it('decodes the skills JSON setting into a typed map', async () => {
    const settings = await getSiteSettings();
    expect(Array.isArray(settings.skills.languages)).toBe(true);
    expect(settings.skills.languages).toContain('TypeScript');
    expect(settings.skills.frameworks).toContain('Next.js');
    expect(settings.skills.databases).toContain('PostgreSQL');
    expect(settings.skills.tools).toContain('Docker');
    expect(Array.isArray(settings.skills.soft)).toBe(true);
  });

  it('exposes About-section stat counters as integers', async () => {
    const settings = await getSiteSettings();
    expect(settings.stats.yearsCoding).toBe(3);
    expect(settings.stats.sitesShipped).toBe(12);
    expect(settings.stats.rolesHeld).toBe(4);
  });

  it('falls back to defaults when stat settings are missing', async () => {
    await getTestDb().setting.deleteMany({
      where: { key: { in: ['stat_years_coding', 'stat_sites_shipped', 'stat_roles_held'] } },
    });
    const settings = await getSiteSettings();
    expect(settings.stats.yearsCoding).toBeGreaterThan(0);
    expect(settings.stats.sitesShipped).toBeGreaterThan(0);
    expect(settings.stats.rolesHeld).toBeGreaterThan(0);
  });
});