import { db } from '../db';

const SITE_SETTING_KEYS = [
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
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export type SkillsByCategory = {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  soft: string[];
};

export type SiteIdentity = {
  siteTitle: string;
  siteTagline: string;
  siteSubtitle: string;
  siteInitials: string;
  aboutBio: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  cvUrl: string;
  socialGithub: string | null;
  socialLinkedin: string | null;
  socialFacebook: string | null;
  socialX: string | null;
};

export type SiteSections = {
  showHero: boolean;
  showAbout: boolean;
  showExperience: boolean;
  showSkills: boolean;
  showEducation: boolean;
  showContact: boolean;
};

export type SiteTheme = {
  accentColor: string;
  accentColor2: string;
  defaultTheme: 'light' | 'dark';
};

export type SiteSettings = {
  identity: SiteIdentity;
  sections: SiteSections;
  theme: SiteTheme;
  skills: SkillsByCategory;
};

const DEFAULTS = {
  site_title: 'Salekin Newaz',
  site_tagline: 'Web developer.',
  site_subtitle: '',
  site_initials: 'SN',
  about_bio: '',
  contact_email: '',
  contact_phone: '',
  contact_location: '',
  cv_url: '/Md_Salekin_Newaz.pdf',
  social_github: '',
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
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    soft: [],
  }),
} as const;

function str(value: string | undefined, fallback: string): string {
  if (value === undefined || value === '') return fallback;
  return value;
}

function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function asTheme(value: string | undefined): 'light' | 'dark' {
  return value === 'light' ? 'light' : 'dark';
}

function accentIsValid(value: string | undefined): boolean {
  if (!value) return false;
  // Strict 6-digit hex. The admin save schema and the layout's hexToRgb both
  // use this shape, so anything else is a tampered DB row and we fall back to
  // the default. Don't accept CSS keywords here — they're CSS-valid but
  // would skip the same-origin style interpolation in app/layout.tsx.
  return /^#[0-9a-f]{6}$/i.test(value);
}

function parseSkills(raw: string | undefined): SkillsByCategory {
  const fallback: SkillsByCategory = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    soft: [],
  };
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return fallback;
    const out: SkillsByCategory = { ...fallback };
    for (const key of Object.keys(out) as (keyof SkillsByCategory)[]) {
      const v = (parsed as Record<string, unknown>)[key];
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
        out[key] = v as string[];
      }
    }
    return out;
  } catch {
    return fallback;
  }
}

/**
 * One read for the whole site. Each consumer picks the slice it needs.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.setting.findMany({
    where: { key: { in: [...SITE_SETTING_KEYS] } },
    select: { key: true, value: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;

  const identity: SiteIdentity = {
    siteTitle: str(map['site_title'], DEFAULTS.site_title),
    siteTagline: str(map['site_tagline'], DEFAULTS.site_tagline),
    siteSubtitle: str(map['site_subtitle'], DEFAULTS.site_subtitle),
    siteInitials: str(map['site_initials'], DEFAULTS.site_initials),
    aboutBio: str(map['about_bio'], DEFAULTS.about_bio),
    contactEmail:
      str(map['contact_email'], DEFAULTS.contact_email) || null,
    contactPhone:
      str(map['contact_phone'], DEFAULTS.contact_phone) || null,
    contactLocation:
      str(map['contact_location'], DEFAULTS.contact_location) || null,
    cvUrl: str(map['cv_url'], DEFAULTS.cv_url),
    socialGithub: str(map['social_github'], DEFAULTS.social_github) || null,
    socialLinkedin:
      str(map['social_linkedin'], DEFAULTS.social_linkedin) || null,
    socialFacebook:
      str(map['social_facebook'], DEFAULTS.social_facebook) || null,
    socialX: str(map['social_x'], DEFAULTS.social_x) || null,
  };

  const sections: SiteSections = {
    showHero: asBool(map['show_hero'], true),
    showAbout: asBool(map['show_about'], true),
    showExperience: asBool(map['show_experience'], true),
    showSkills: asBool(map['show_skills'], true),
    showEducation: asBool(map['show_education'], true),
    showContact: asBool(map['show_contact'], true),
  };

  const theme: SiteTheme = {
    accentColor: accentIsValid(map['accent_color'])
      ? (map['accent_color'] as string)
      : DEFAULTS.accent_color,
    accentColor2: accentIsValid(map['accent_color_2'])
      ? (map['accent_color_2'] as string)
      : DEFAULTS.accent_color_2,
    defaultTheme: asTheme(map['default_theme']),
  };

  const skills = parseSkills(map['skills']);

  return { identity, sections, theme, skills };
}