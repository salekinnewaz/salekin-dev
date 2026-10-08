'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const identitySchema = z.object({
  siteTitle: z.string().min(1).max(120),
  siteTagline: z.string().min(1).max(240),
  siteSubtitle: z.string().max(240).optional().default(''),
  siteInitials: z.string().min(1).max(4),
  aboutBio: z.string().max(2000).optional().default(''),
  contactEmail: z.string().email().optional().or(z.literal('')).default(''),
  contactPhone: z.string().max(40).optional().default(''),
  contactLocation: z.string().max(120).optional().default(''),
  cvUrl: z.string().min(1).max(240),
  socialGithub: z.string().url().optional().or(z.literal('')).default(''),
  socialLinkedin: z.string().url().optional().or(z.literal('')).default(''),
  socialFacebook: z.string().url().optional().or(z.literal('')).default(''),
  socialX: z.string().url().optional().or(z.literal('')).default(''),
});

const sectionsSchema = z.object({
  showHero: z.boolean(),
  showAbout: z.boolean(),
  showExperience: z.boolean(),
  showSkills: z.boolean(),
  showEducation: z.boolean(),
  showContact: z.boolean(),
});

const themeSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i, 'Must be a #rrggbb hex'),
  accentColor2: z.string().regex(/^#[0-9a-f]{6}$/i, 'Must be a #rrggbb hex'),
  defaultTheme: z.enum(['light', 'dark']),
});

const skillCategorySchema = z.array(z.string().min(1).max(60)).max(50);

const skillsSchema = z.object({
  languages: skillCategorySchema,
  frameworks: skillCategorySchema,
  databases: skillCategorySchema,
  tools: skillCategorySchema,
  soft: skillCategorySchema,
});

// Stats are small integer counters shown in the About section. We
// accept strings from the form (everything is a string in FormData)
// and parse them server-side, clamping to 0..999 so a typo can't
// break the layout.
const statsSchema = z.object({
  yearsCoding: z.coerce.number().int().min(0).max(999),
  sitesShipped: z.coerce.number().int().min(0).max(999),
  rolesHeld: z.coerce.number().int().min(0).max(999),
});

const fullSettingsSchema = z.object({
  identity: identitySchema,
  sections: sectionsSchema,
  theme: themeSchema,
  skills: skillsSchema,
  stats: statsSchema,
});

// ---------------------------------------------------------------------------
// Result type (for useActionState)
// ---------------------------------------------------------------------------

export type SaveSettingsState =
  | { ok: true }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

function emptyToNull(value: string): string {
  return value.trim() === '' ? '' : value;
}

export async function saveSettingsAction(
  _prev: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {
  // Parse identity
  const identity = identitySchema.safeParse({
    siteTitle: formData.get('siteTitle'),
    siteTagline: formData.get('siteTagline'),
    siteSubtitle: emptyToNull(String(formData.get('siteSubtitle') ?? '')),
    siteInitials: String(formData.get('siteInitials') ?? '').toUpperCase(),
    aboutBio: emptyToNull(String(formData.get('aboutBio') ?? '')),
    contactEmail: emptyToNull(String(formData.get('contactEmail') ?? '')),
    contactPhone: emptyToNull(String(formData.get('contactPhone') ?? '')),
    contactLocation: emptyToNull(String(formData.get('contactLocation') ?? '')),
    cvUrl: String(formData.get('cvUrl') ?? ''),
    socialGithub: emptyToNull(String(formData.get('socialGithub') ?? '')),
    socialLinkedin: emptyToNull(String(formData.get('socialLinkedin') ?? '')),
    socialFacebook: emptyToNull(String(formData.get('socialFacebook') ?? '')),
    socialX: emptyToNull(String(formData.get('socialX') ?? '')),
  });
  if (!identity.success) {
    return { ok: false, error: formatIssues(identity.error) };
  }

  // Parse sections
  const sections = sectionsSchema.safeParse({
    showHero: formData.get('showHero') === 'on',
    showAbout: formData.get('showAbout') === 'on',
    showExperience: formData.get('showExperience') === 'on',
    showSkills: formData.get('showSkills') === 'on',
    showEducation: formData.get('showEducation') === 'on',
    showContact: formData.get('showContact') === 'on',
  });
  if (!sections.success) {
    return { ok: false, error: formatIssues(sections.error) };
  }

  // Parse theme
  const theme = themeSchema.safeParse({
    accentColor: formData.get('accentColor'),
    accentColor2: formData.get('accentColor2'),
    defaultTheme: formData.get('defaultTheme'),
  });
  if (!theme.success) {
    return { ok: false, error: formatIssues(theme.error) };
  }

  // Parse skills — comma-separated inputs
  const skills = skillsSchema.safeParse({
    languages: parseList(formData.get('languages')),
    frameworks: parseList(formData.get('frameworks')),
    databases: parseList(formData.get('databases')),
    tools: parseList(formData.get('tools')),
    soft: parseList(formData.get('soft')),
  });
  if (!skills.success) {
    return { ok: false, error: formatIssues(skills.error) };
  }

  // Parse stats — small integer counters, FormData strings.
  const stats = statsSchema.safeParse({
    yearsCoding: formData.get('statYearsCoding') ?? '0',
    sitesShipped: formData.get('statSitesShipped') ?? '0',
    rolesHeld: formData.get('statRolesHeld') ?? '0',
  });
  if (!stats.success) {
    return { ok: false, error: formatIssues(stats.error) };
  }

  const parsed = fullSettingsSchema.safeParse({
    identity: identity.data,
    sections: sections.data,
    theme: theme.data,
    skills: skills.data,
    stats: stats.data,
  });
  if (!parsed.success) {
    return { ok: false, error: formatIssues(parsed.error) };
  }

  // Persist
  try {
    const writes: { key: string; value: string }[] = [
      { key: 'site_title', value: parsed.data.identity.siteTitle },
      { key: 'site_tagline', value: parsed.data.identity.siteTagline },
      { key: 'site_subtitle', value: parsed.data.identity.siteSubtitle },
      { key: 'site_initials', value: parsed.data.identity.siteInitials },
      { key: 'about_bio', value: parsed.data.identity.aboutBio },
      { key: 'contact_email', value: parsed.data.identity.contactEmail },
      { key: 'contact_phone', value: parsed.data.identity.contactPhone },
      { key: 'contact_location', value: parsed.data.identity.contactLocation },
      { key: 'cv_url', value: parsed.data.identity.cvUrl },
      { key: 'social_github', value: parsed.data.identity.socialGithub },
      { key: 'social_linkedin', value: parsed.data.identity.socialLinkedin },
      { key: 'social_facebook', value: parsed.data.identity.socialFacebook },
      { key: 'social_x', value: parsed.data.identity.socialX },
      { key: 'show_hero', value: String(parsed.data.sections.showHero) },
      { key: 'show_about', value: String(parsed.data.sections.showAbout) },
      { key: 'show_experience', value: String(parsed.data.sections.showExperience) },
      { key: 'show_skills', value: String(parsed.data.sections.showSkills) },
      { key: 'show_education', value: String(parsed.data.sections.showEducation) },
      { key: 'show_contact', value: String(parsed.data.sections.showContact) },
      { key: 'accent_color', value: parsed.data.theme.accentColor },
      { key: 'accent_color_2', value: parsed.data.theme.accentColor2 },
      { key: 'default_theme', value: parsed.data.theme.defaultTheme },
      { key: 'skills', value: JSON.stringify(parsed.data.skills) },
      { key: 'stat_years_coding', value: String(parsed.data.stats.yearsCoding) },
      { key: 'stat_sites_shipped', value: String(parsed.data.stats.sitesShipped) },
      { key: 'stat_roles_held', value: String(parsed.data.stats.rolesHeld) },
    ];

    for (const w of writes) {
      await db.setting.upsert({
        where: { key: w.key },
        update: { value: w.value },
        create: { key: w.key, value: w.value },
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    console.error('saveSettingsAction failed:', err);
    return { ok: false, error: 'Database write failed. Please try again.' };
  }
}

function parseList(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function formatIssues(err: z.ZodError): string {
  return err.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
}