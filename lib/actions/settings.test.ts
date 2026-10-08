import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { saveSettingsAction } from './settings';
import { getTestDb } from '../../tests/helpers/db';

// saveSettingsAction writes a fixed set of setting keys. To keep these
// tests independent of (and safe alongside) the seed data used by other
// test files, we save the prior values before each test and restore them
// after.

const SETTING_KEYS = [
  'site_title',
  'site_tagline',
  'site_subtitle',
  'site_initials',
  'about_bio',
  'contact_email',
  'contact_phone',
  'contact_location',
  'cv_url',
  'social_github',
  'social_linkedin',
  'social_facebook',
  'social_x',
  'show_hero',
  'show_about',
  'show_experience',
  'show_skills',
  'show_education',
  'show_contact',
  'accent_color',
  'accent_color_2',
  'default_theme',
  'skills',
];

async function snapshot(): Promise<Record<string, string>> {
  const rows = await getTestDb().setting.findMany({
    where: { key: { in: SETTING_KEYS } },
    select: { key: true, value: true },
  });
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

async function restore(snap: Record<string, string>): Promise<void> {
  for (const key of SETTING_KEYS) {
    const prior = snap[key];
    if (prior === undefined) {
      await getTestDb().setting.deleteMany({ where: { key } });
    } else {
      await getTestDb().setting.upsert({
        where: { key },
        update: { value: prior },
        create: { key, value: prior },
      });
    }
  }
}

function buildValidForm(overrides: Partial<Record<string, string>> = {}): FormData {
  const fd = new FormData();
  const setIf = (k: string, v: string) => fd.set(k, overrides[k] ?? v);
  setIf('siteTitle', 'Test Site');
  setIf('siteTagline', 'A tagline.');
  setIf('siteSubtitle', '');
  setIf('siteInitials', 'TS');
  setIf('aboutBio', 'About text.');
  setIf('contactEmail', '');
  setIf('contactPhone', '');
  setIf('contactLocation', '');
  setIf('cvUrl', '/cv.pdf');
  setIf('socialGithub', '');
  setIf('socialLinkedin', '');
  setIf('socialFacebook', '');
  setIf('socialX', '');
  fd.set('showHero', 'on');
  fd.set('showAbout', 'on');
  fd.set('showExperience', 'on');
  fd.set('showSkills', 'on');
  fd.set('showEducation', 'on');
  fd.set('showContact', 'on');
  fd.set('accentColor', '#a78bfa');
  fd.set('accentColor2', '#22d3ee');
  fd.set('defaultTheme', 'dark');
  fd.set('languages', 'TypeScript, JavaScript');
  fd.set('frameworks', 'Next.js, React');
  fd.set('databases', 'PostgreSQL');
  fd.set('tools', 'Git, Docker');
  fd.set('soft', '');
  return fd;
}

describe('actions/settings (saveSettingsAction)', () => {
  let snap: Record<string, string>;

  beforeEach(async () => {
    snap = await snapshot();
    vi.mocked(revalidatePath).mockClear();
  });
  afterEach(async () => {
    await restore(snap);
  });

  it('persists a valid form and revalidates /', async () => {
    const r = await saveSettingsAction({ ok: false, error: '' }, buildValidForm());
    expect(r).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('rejects an invalid email', async () => {
    const fd = buildValidForm({ contactEmail: 'not-an-email' });
    const r = await saveSettingsAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
  });

  it('rejects an invalid social URL', async () => {
    const fd = buildValidForm({ socialGithub: 'not-a-url' });
    const r = await saveSettingsAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
  });

  it('returns ok when optional section checkboxes are all off', async () => {
    const fd = buildValidForm();
    for (const k of [
      'showHero',
      'showAbout',
      'showExperience',
      'showSkills',
      'showEducation',
      'showContact',
    ]) {
      fd.delete(k);
    }
    const r = await saveSettingsAction({ ok: false, error: '' }, fd);
    expect(r).toEqual({ ok: true });
  });

  it('returns a safe error message when the DB write throws', async () => {
    const { db } = await import('@/lib/db');
    const spy = vi
      .spyOn(db.setting, 'upsert')
      .mockRejectedValueOnce(new Error('boom'));
    try {
      const r = await saveSettingsAction({ ok: false, error: '' }, buildValidForm());
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/database|write/i);
    } finally {
      spy.mockRestore();
    }
  });
});