import { db } from '../db';
import {
  DEFAULT_PROFILE_MODE,
  type ProfileImageMode,
} from '../constants';

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
  'available_for_work',
  'accent_color',
  'accent_color_2',
  'default_theme',
  'skills',
  'stat_years_coding',
  'stat_sites_shipped',
  'stat_roles_held',
  // NOTE: 'profile_image' is deliberately absent. It holds the portrait
  // as a multi-megabyte base64 data URI, and this query runs on every
  // dynamic page. See getProfileImageVersion() and
  // getProfileImageDataUri() for the two narrow reads that do need it.
  'profile_image_position',
  'profile_image_has_alpha',
  'profile_image_set',
  'profile_image_mode',
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export type SkillsByCategory = {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  soft: string[];
};

/**
 * Editable About-section stat counters. Each value is rendered with the
 * matching label/suffix in the About section. All values are admin-editable
 * via the site settings page; defaults are honest numbers from the CV.
 */
export type SiteStats = {
  yearsCoding: number;
  sitesShipped: number;
  rolesHeld: number;
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

/**
 * The owner's current availability.
 *
 * The hero's "Available for Work" badge is driven by this flag rather
 * than being hard-coded, because a badge that claims availability is
 * a factual claim about the owner. The admin can turn it off the
 * moment it stops being true, without a code change or a redeploy.
 *
 * It lives outside `SiteSections` because it is a statement about the
 * person, not a toggle for one of the page's sections.
 */
export type SiteAvailability = {
  /** Whether the "Available for Work" badge is shown. */
  availableForWork: boolean;
};

export type SiteTheme = {
  accentColor: string;
  accentColor2: string;
  defaultTheme: 'light' | 'dark';
};

/**
 * The admin-managed profile portrait.
 *
 * `dataUri` holds the uploaded image as a base64 data URI. It lives in
 * the same `Setting` table as every other editable value, so it persists
 * in Turso across refreshes, redeploys and sign-in cycles without
 * introducing a second storage system or any new credentials.
 *
 * `position` is the CSS `object-position` value applied to the portrait
 * so an admin can reframe a crop without re-uploading.
 */
export type SiteProfileImage = {
  /**
   * Whether a custom portrait is stored, as opposed to the default.
   *
   * The bytes are deliberately NOT part of this shape. `getSiteSettings()`
   * runs on every render of a `force-dynamic` page, and the portrait is
   * a multi-megabyte base64 data URI — selecting it there would put
   * megabytes into every page's query path for no benefit, since the
   * only consumer of the bytes is `/profile-image`, which reads them
   * through `getProfileImageDataUri()` instead.
   */
  hasCustomImage: boolean;
  /** CSS `object-position` for the portrait, e.g. "50% 30%". */
  position: string;
  /**
   * A cache-busting token derived from the row's `updatedAt`. It changes
   * whenever the portrait is replaced or restored, so the Hero can
   * append it to the image URL and pick up a new file immediately.
   */
  version: string;
  /** Whether the stored portrait carries an alpha channel. */
  hasAlpha: boolean;
  /**
   * How the hero renders the portrait: `cutout` letterboxes it into the
   * stage so the subject stands on the tilted frame, `photo` fills the
   * tilted frame with it.
   */
  mode: ProfileImageMode;
};

export type SiteSettings = {
  identity: SiteIdentity;
  sections: SiteSections;
  availability: SiteAvailability;
  theme: SiteTheme;
  skills: SkillsByCategory;
  stats: SiteStats;
  profileImage: SiteProfileImage;
};

const DEFAULTS = {
  site_title: 'Md Salekin Newaz',
  site_tagline:
    'Building quality infrastructure that enables engineering teams to release with confidence.',
  site_subtitle:
    'Senior Software QA Engineer @ Brain Station 23 · ISTQB® Certified',
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
  available_for_work: 'true',
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
  // Honest defaults from the CV / seed data. Years coding is the
  // span from first role (2022) to now; sites shipped is the
  // documented 24 from the StackRefactor role; roles held counts
  // the 5 distinct positions in the experience seed.
  stat_years_coding: '4',
  stat_sites_shipped: '24',
  stat_roles_held: '5',
  // Empty = use the shipped default portrait at /images/profile.jpg.
  profile_image: '',
  profile_image_position: '50% 30%',
} as const;

/**
 * A stored portrait is a base64 data URI. We only accept the image
 * MIME types the admin upload allows, and cap the length so a rogue row
 * cannot blow up the settings read. 3 MB of binary is ~4 MB of base64;
 * the cap leaves headroom for that.
 */
export const MAX_DATA_URI_LENGTH = 7_000_000;

const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/**
 * Parse the stored profile image metadata.
 *
 * This never touches the image bytes. "Is a custom portrait stored?" is
 * answered by the `profile_image_set` flag the upload/restore actions
 * maintain, so a multi-megabyte data URI is never pulled into the
 * settings read that every page performs.
 *
 * `hasAlpha` decides how the hero renders the portrait. When the
 * `profile_image_has_alpha` row is missing — an image stored before
 * that row existed — the mode falls back to the conservative default
 * (`cutout`), which letterboxes the portrait exactly the way the
 * shipped cut-out already does.
 *
 * `mode` is the admin's explicit override when present. The upload
 * action writes it from the *bytes* (via `hasAlphaChannel`), so it is
 * authoritative whenever it is set.
 */
function parseProfileImage(
  isSet: string | undefined,
  position: string | undefined,
  version: string,
  hasAlphaRow: string | undefined,
  modeOverride: string | undefined,
  legacyHasImage: boolean,
): SiteProfileImage {
  const positionValue = parsePosition(position);
  // The flag row is authoritative when it exists. When it is missing —
  // an image stored before the flag was introduced — fall back to the
  // cheap "is the row non-empty" check so an existing portrait is not
  // reported as absent.
  const hasCustomImage =
    isSet === undefined ? legacyHasImage : asBool(isSet, false);
  const hasAlpha = asBool(hasAlphaRow, true);

  // An explicit admin override wins over the detected mode. Without
  // one, the alpha flag decides: a transparent PNG stands on the
  // frame, an opaque JPEG fills it.
  const mode: ProfileImageMode =
    modeOverride === 'cutout' || modeOverride === 'photo'
      ? modeOverride
      : hasAlpha
        ? DEFAULT_PROFILE_MODE
        : 'photo';

  return {
    hasCustomImage,
    position: positionValue,
    version,
    hasAlpha,
    mode,
  };
}

/**
 * `object-position` accepts a pair of percentages or a keyword. We only
 * accept the percentage form so the admin UI can render it back into a
 * slider without parsing CSS.
 */
function parsePosition(value: string | undefined): string {
  if (!value) return DEFAULTS.profile_image_position;
  const match = /^(\d{1,3})%\s+(\d{1,3})%$/.exec(value.trim());
  if (!match) return DEFAULTS.profile_image_position;
  const x = Math.max(0, Math.min(100, Number(match[1])));
  const y = Math.max(0, Math.min(100, Number(match[2])));
  return `${x}% ${y}%`;
}

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

/** Parse a stat counter. Clamped to 0..999 so a typo in admin can't
 *  produce a 7-digit number that breaks the layout. */
function asInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(999, n));
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
 *
 * The `profile_image` row is deliberately NOT part of this query. It
 * holds the portrait as a base64 data URI — megabytes — and every
 * dynamic page runs this function. Its `updatedAt` is read separately
 * by `getProfileImageVersion()`, without the value; the bytes are
 * fetched by `getProfileImageDataUri()`, used solely by the
 * `/profile-image` route.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.setting.findMany({
    where: { key: { in: [...SITE_SETTING_KEYS] } },
    select: { key: true, value: true, updatedAt: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  // The portrait's version token comes from its row's `updatedAt`. The
  // row itself is read separately, without its value, so the
  // multi-megabyte data URI never reaches this query.
  const version = await getProfileImageVersion();

  // Legacy fallback: an image stored before the `profile_image_set`
  // flag existed has no flag row. Only then do we pay for a second
  // query, and only to learn whether that row holds anything.
  const legacyHasImage =
    map['profile_image_set'] === undefined
      ? await hasStoredProfileImage()
      : false;

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

  const availability: SiteAvailability = {
    availableForWork: asBool(map['available_for_work'], true),
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

  const stats: SiteStats = {
    yearsCoding: asInt(map['stat_years_coding'], Number(DEFAULTS.stat_years_coding)),
    sitesShipped: asInt(map['stat_sites_shipped'], Number(DEFAULTS.stat_sites_shipped)),
    rolesHeld: asInt(map['stat_roles_held'], Number(DEFAULTS.stat_roles_held)),
  };

  const profileImage = parseProfileImage(
    map['profile_image_set'],
    map['profile_image_position'],
    version,
    map['profile_image_has_alpha'],
    map['profile_image_mode'],
    legacyHasImage,
  );

  return { identity, sections, availability, theme, skills, stats, profileImage };
}

/**
 * The cache-busting version token for the portrait.
 *
 * Derived from the `profile_image` row's `updatedAt`, so it changes
 * whenever the portrait is replaced or restored. The row's *value* is
 * not selected — only its timestamp — which keeps the multi-megabyte
 * data URI out of the settings read.
 */
export async function getProfileImageVersion(): Promise<string> {
  const row = await db.setting.findUnique({
    where: { key: 'profile_image' },
    select: { updatedAt: true },
  });
  return row ? row.updatedAt.getTime().toString(36) : '0';
}

/**
 * Whether the `profile_image` row holds anything, without pulling the
 * multi-megabyte value across the wire.
 *
 * This is the legacy path — it only runs when the `profile_image_set`
 * flag row is absent, i.e. for a portrait stored before that flag
 * existed. On every normal request the flag answers the question for
 * free.
 */
async function hasStoredProfileImage(): Promise<boolean> {
  const rows = await db.setting.findMany({
    where: { key: 'profile_image' },
    select: { value: true },
  });
  const raw = rows[0]?.value;
  if (!raw) return false;
  const match = /^data:([^;,]+);base64,/.exec(raw);
  return Boolean(match && ALLOWED_IMAGE_MIME.has(match[1] ?? ''));
}

/**
 * The stored portrait's bytes, as a base64 data URI.
 *
 * This is the *only* path that reads the `profile_image` value, and it
 * exists so that the multi-megabyte value stays out of the settings
 * read every page performs. Returns null when nothing usable is
 * stored, which tells the caller to serve the shipped default.
 */
export async function getProfileImageDataUri(): Promise<string | null> {
  const row = await db.setting.findUnique({
    where: { key: 'profile_image' },
    select: { value: true },
  });
  const raw = row?.value;
  if (!raw || raw.length > MAX_DATA_URI_LENGTH) return null;

  const match = /^data:([^;,]+);base64,/.exec(raw);
  if (!match || !ALLOWED_IMAGE_MIME.has(match[1] ?? '')) return null;

  return raw;
}
