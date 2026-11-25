import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSiteSettings, getProfileImageDataUri, MAX_DATA_URI_LENGTH } from './site';
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

  it('reports availability as on by default', async () => {
    const settings = await getSiteSettings();
    expect(settings.availability.availableForWork).toBe(true);
  });

  it('reads the availability flag from its own setting row', async () => {
    await getTestDb().setting.upsert({
      where: { key: 'available_for_work' },
      update: { value: 'false' },
      create: { key: 'available_for_work', value: 'false' },
    });
    const settings = await getSiteSettings();
    expect(settings.availability.availableForWork).toBe(false);
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
    // `yearsCoding` and `rolesHeld` have honest positive defaults
    // (verified career path). `sitesShipped` is intentionally 0 —
    // the prior "24" claim is not in the verified career path and
    // the counter is not rendered on the public site.
    expect(settings.stats.yearsCoding).toBeGreaterThan(0);
    expect(settings.stats.sitesShipped).toBe(0);
    expect(settings.stats.rolesHeld).toBeGreaterThan(0);
  });

  // ─── Profile image ───────────────────────────────────────────────

  async function clearProfileRows() {
    await getTestDb().setting.deleteMany({
      where: {
        key: {
          in: [
            'profile_image',
            'profile_image_position',
            'profile_image_has_alpha',
            'profile_image_set',
            'profile_image_mode',
          ],
        },
      },
    });
  }

  async function setProfileRow(key: string, value: string) {
    await getTestDb().setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  it('reports no custom portrait when nothing is stored', async () => {
    await clearProfileRows();
    const settings = await getSiteSettings();
    expect(settings.profileImage.hasCustomImage).toBe(false);
    expect(settings.profileImage.position).toBe('50% 30%');
  });

  it('reports a stored portrait without reading its bytes', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image_set', 'true');
    await setProfileRow(
      'profile_image',
      `data:image/png;base64,${Buffer.from('x').toString('base64')}`,
    );
    const settings = await getSiteSettings();
    expect(settings.profileImage.hasCustomImage).toBe(true);
    expect(settings.profileImage.position).toBe('50% 30%');
  });

  it('returns the stored crop position', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image_position', '25% 80%');
    const settings = await getSiteSettings();
    expect(settings.profileImage.position).toBe('25% 80%');
  });

  it('clamps an out-of-range stored crop position', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image_position', '400% 900%');
    const settings = await getSiteSettings();
    expect(settings.profileImage.position).toBe('100% 100%');
  });

  it('falls back to the default crop for a malformed stored position', async () => {
    await getTestDb().setting.upsert({
      where: { key: 'profile_image_position' },
      update: { value: 'center top' },
      create: { key: 'profile_image_position', value: 'center top' },
    });
    const settings = await getSiteSettings();
    expect(settings.profileImage.position).toBe('50% 30%');
  });

  it('exposes a version token that changes when the portrait changes', async () => {
    const before = await getSiteSettings();
    const v1 = before.profileImage.version;
    await getTestDb().setting.upsert({
      where: { key: 'profile_image' },
      update: { value: `data:image/png;base64,${Buffer.from('y').toString('base64')}` },
      create: { key: 'profile_image', value: `data:image/png;base64,${Buffer.from('y').toString('base64')}` },
    });
    const after = await getSiteSettings();
    expect(after.profileImage.version).not.toBe(v1);
  });

  // ─── Render mode ─────────────────────────────────────────────────

  it('falls back to the cut-out rendering when the alpha flag is missing', async () => {
    await clearProfileRows();
    const settings = await getSiteSettings();
    // The conservative fallback is the cut-out rendering — the same
    // letterboxing the shipped default uses.
    expect(settings.profileImage.mode).toBe('cutout');
    expect(settings.profileImage.hasAlpha).toBe(true);
  });

  it('reads the alpha flag from its own row', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image_has_alpha', 'false');
    const settings = await getSiteSettings();
    expect(settings.profileImage.mode).toBe('photo');
    expect(settings.profileImage.hasAlpha).toBe(false);
  });

  it('lets an explicit render-mode override win over the alpha flag', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image_has_alpha', 'false');
    await setProfileRow('profile_image_mode', 'cutout');
    const settings = await getSiteSettings();
    expect(settings.profileImage.mode).toBe('cutout');
  });

  it('ignores an unrecognised render-mode override', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image_has_alpha', 'false');
    await setProfileRow('profile_image_mode', 'nonsense');
    const settings = await getSiteSettings();
    expect(settings.profileImage.mode).toBe('photo');
  });

  it('reports whether a custom portrait is stored', async () => {
    await clearProfileRows();
    const empty = await getSiteSettings();
    expect(empty.profileImage.hasCustomImage).toBe(false);

    await setProfileRow('profile_image_set', 'true');
    const stored = await getSiteSettings();
    expect(stored.profileImage.hasCustomImage).toBe(true);
  });

  it('falls back to the stored row when the set flag is missing', async () => {
    await clearProfileRows();
    // No `profile_image_set` row — as if the portrait had been stored
    // before that flag existed.
    await setProfileRow(
      'profile_image',
      `data:image/png;base64,${Buffer.from('x').toString('base64')}`,
    );
    const settings = await getSiteSettings();
    expect(settings.profileImage.hasCustomImage).toBe(true);
  });

  it('does not report a legacy portrait with an unusable MIME type', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image', 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    const settings = await getSiteSettings();
    expect(settings.profileImage.hasCustomImage).toBe(false);
  });

  it('trusts the set flag over the stored row', async () => {
    await clearProfileRows();
    // The flag says "restored to default" while a stale value lingers.
    await setProfileRow('profile_image_set', 'false');
    await setProfileRow(
      'profile_image',
      `data:image/png;base64,${Buffer.from('x').toString('base64')}`,
    );
    const settings = await getSiteSettings();
    expect(settings.profileImage.hasCustomImage).toBe(false);
  });

  // ─── The narrow byte read ────────────────────────────────────────

  it('returns the stored portrait bytes through the narrow query', async () => {
    await clearProfileRows();
    const dataUri = `data:image/png;base64,${Buffer.from('x').toString('base64')}`;
    await setProfileRow('profile_image', dataUri);
    const stored = await getProfileImageDataUri();
    expect(stored).toBe(dataUri);
  });

  it('returns null when no portrait is stored', async () => {
    await clearProfileRows();
    expect(await getProfileImageDataUri()).toBeNull();
  });

  it('rejects a stored portrait with an unsupported MIME type', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image', 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    expect(await getProfileImageDataUri()).toBeNull();
  });

  it('rejects a stored portrait that is not a data URI at all', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image', '/etc/passwd');
    expect(await getProfileImageDataUri()).toBeNull();
  });

  it('rejects an over-long stored portrait', async () => {
    await clearProfileRows();
    await setProfileRow('profile_image', 'x'.repeat(MAX_DATA_URI_LENGTH + 1));
    expect(await getProfileImageDataUri()).toBeNull();
  });
});
