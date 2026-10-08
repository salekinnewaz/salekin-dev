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
  'stat_years_coding',
  'stat_sites_shipped',
  'stat_roles_held',
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
  setIf('statYearsCoding', '3');
  setIf('statSitesShipped', '12');
  setIf('statRolesHeld', '4');
  return fd;
}

describe('actions/settings (saveSettingsAction)', () => {
  let snap: Record<string, string>;

  beforeEach(async () => {
    snap = await snapshot();
    vi.mocked(revalidatePath).mockClear();
    // Restore any spies that the previous test installed; otherwise
    // the `db.setting.upsert` mock from "DB write throws" leaks into
    // later tests as "upsert is not a function".
    vi.restoreAllMocks();
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
    // We can't use vi.spyOn(db.setting, 'upsert') here because
    // `mockRestore` on Prisma model methods leaves them in an
    // undefined state in this version of vitest, which would corrupt
    // every subsequent test in the file. Instead, we replace the
    // upsert on the production `db` (which the action actually uses
    // and which is bound to the same test SQLite via tests/setup.ts)
    // for the duration of the test, then put the original back.
    const { db } = await import('@/lib/db');
    const original = db.setting.upsert;
    db.setting.upsert = (() =>
      Promise.reject(new Error('boom'))) as typeof original;
    try {
      const r = await saveSettingsAction({ ok: false, error: '' }, buildValidForm());
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/database|write/i);
    } finally {
      db.setting.upsert = original;
    }
  });

  it('persists About-section stat counters', async () => {
    const r = await saveSettingsAction({ ok: false, error: '' }, buildValidForm());
    expect(r).toEqual({ ok: true });
    const stored = await getTestDb().setting.findMany({
      where: { key: { in: ['stat_years_coding', 'stat_sites_shipped', 'stat_roles_held'] } },
    });
    const map = Object.fromEntries(stored.map((s) => [s.key, s.value]));
    expect(map['stat_years_coding']).toBe('3');
    expect(map['stat_sites_shipped']).toBe('12');
    expect(map['stat_roles_held']).toBe('4');
  });

  it('clamps out-of-range stat counters', async () => {
    const fd = buildValidForm({
      statYearsCoding: '9999',
      statSitesShipped: '-3',
      statRolesHeld: '7',
    });
    const r = await saveSettingsAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false); // out-of-range fails validation, doesn't crash
  });
});