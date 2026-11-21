'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { isAdminConfigured, isAuthed } from '@/lib/security/admin-session';
import { hashBytes } from '@/lib/utils/hash';
import { hasAlphaChannel } from '@/lib/utils/image-alpha';
import { PROFILE_IMAGE_SETTING_KEYS } from '@/lib/constants';
import { MAX_DATA_URI_LENGTH } from '@/lib/queries/site';

/**
 * Profile image management.
 *
 * Storage: the portrait is persisted as a base64 data URI in the
 * existing `Setting` table (key `profile_image`). That table is
 * already Turso-backed, so the image survives refreshes, browser
 * restarts, logout/login cycles and redeploys — no new infrastructure
 * and no storage credentials. The public read path is
 * `GET /profile-image` (app/profile-image/route.ts).
 *
 * Security: every action re-checks the admin session server-side.
 * The /admin page gate is not sufficient on its own — a Server
 * Action is a public HTTP endpoint, so an unauthorised caller could
 * POST to it directly. All three actions call `requireAdmin()` and
 * bail out before touching the database.
 */

/**
 * 3 MB of raw binary. Base64 inflates by ~4/3, so a 3 MB upload is
 * about 4 MB of data URI.
 *
 * Why not 5 MB: the hosting platform rejects request bodies over
 * about 4.5 MB with a bare HTTP 413, before this action ever runs. A
 * 5 MB limit would therefore be unreachable in production — the
 * admin would see a platform error instead of this app's friendly
 * message. 3 MB leaves enough headroom for the multipart overhead and
 * still fits comfortably inside the database's TEXT capacity.
 */
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const SETTING_IMAGE_KEY = PROFILE_IMAGE_SETTING_KEYS.image;
const SETTING_POSITION_KEY = PROFILE_IMAGE_SETTING_KEYS.position;
const SETTING_HAS_ALPHA_KEY = PROFILE_IMAGE_SETTING_KEYS.hasAlpha;
const SETTING_IS_SET_KEY = PROFILE_IMAGE_SETTING_KEYS.isSet;
const SETTING_MODE_KEY = PROFILE_IMAGE_SETTING_KEYS.mode;

export type ProfileImageState =
  | {
      ok: true;
      message: string;
      /** The content hash of the stored image, used to bust caches. */
      version?: string;
    }
  | { ok: false; error: string };

/**
 * Server-side authorisation gate. Returns true when the caller holds a
 * valid admin session.
 */
async function requireAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) {
    // In production an unconfigured admin panel 404s, so an action
    // reaching here is a misconfiguration — fail closed.
    if (env.NODE_ENV === 'production') return false;
    // Dev: no password is set, so the /admin page itself is open.
    // Match that behaviour so the image manager stays usable locally.
    return true;
  }
  const c = await cookies();
  return isAuthed(c.get('admin_session')?.value);
}

/**
 * Detect the real image type from the leading bytes (magic numbers).
 * The browser-reported MIME type is attacker-controlled, so it can
 * only ever be used as a hint — never as the source of truth.
 */
function sniffImageMime(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

/**
 * Save a new portrait.
 *
 * Accepts a multipart/form-data upload. The file is validated twice:
 * client-side (fast feedback) and here (the authoritative check).
 */
export async function saveProfileImageAction(
  _prev: ProfileImageState,
  formData: FormData,
): Promise<ProfileImageState> {
  if (!(await requireAdmin())) {
    return { ok: false, error: 'Not authorized.' };
  }

  const file = formData.get('profileImage');
  if (!file || typeof file === 'string') {
    return { ok: false, error: 'Choose an image to upload.' };
  }

  const declaredType = (file.type || '').toLowerCase();
  if (declaredType && !ALLOWED_MIME.has(declaredType)) {
    return {
      ok: false,
      error: 'Unsupported file type. Use JPG, PNG or WebP.',
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: 'Image is too large. The maximum is 3 MB.',
    };
  }

  let bytes: Buffer;
  try {
    const buf = await file.arrayBuffer();
    if (buf.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: 'Image is too large. The maximum is 3 MB.' };
    }
    bytes = Buffer.from(buf);
  } catch {
    return { ok: false, error: 'Could not read the uploaded file.' };
  }

  const sniffed = sniffImageMime(bytes);
  if (!sniffed) {
    return {
      ok: false,
      error: 'That file is not a valid JPG, PNG or WebP image.',
    };
  }
  if (declaredType && declaredType !== sniffed) {
    // The declared type and the real bytes disagree — the file was
    // renamed or is tampered with. Refuse rather than trust either.
    return {
      ok: false,
      error: 'The file contents do not match its type. Please re-export it.',
    };
  }

  const dataUri = `data:${sniffed};base64,${bytes.toString('base64')}`;

  // The write side needs its own bound: the read side refuses an
  // over-long row, but a row that was stored oversized would be
  // invisible rather than rejected.
  if (dataUri.length > MAX_DATA_URI_LENGTH) {
    return {
      ok: false,
      error: 'Image is too large. The maximum is 3 MB.',
    };
  }

  // Whether the image carries an alpha channel decides how the hero
  // renders it: a cut-out stands on the frame, an opaque photo fills
  // it. This is read from the bytes, not from the declared MIME.
  const alpha = hasAlphaChannel(bytes, sniffed);

  // Keep the object-position alongside the image so a crop survives a
  // subsequent image replacement only when the admin explicitly asks
  // for it (the form sends the current position).
  const position = parsePosition(formData.get('position'));

  // An explicit render-mode override from the admin panel wins over
  // the detected one. Clearing it returns the hero to detection.
  const mode = parseMode(formData.get('mode'));

  try {
    await db.setting.upsert({
      where: { key: SETTING_IMAGE_KEY },
      update: { value: dataUri },
      create: { key: SETTING_IMAGE_KEY, value: dataUri },
    });
    await db.setting.upsert({
      where: { key: SETTING_POSITION_KEY },
      update: { value: position },
      create: { key: SETTING_POSITION_KEY, value: position },
    });
    await db.setting.upsert({
      where: { key: SETTING_HAS_ALPHA_KEY },
      update: { value: alpha ? 'true' : 'false' },
      create: { key: SETTING_HAS_ALPHA_KEY, value: alpha ? 'true' : 'false' },
    });
    await db.setting.upsert({
      where: { key: SETTING_IS_SET_KEY },
      update: { value: 'true' },
      create: { key: SETTING_IS_SET_KEY, value: 'true' },
    });
    await db.setting.upsert({
      where: { key: SETTING_MODE_KEY },
      update: { value: mode },
      create: { key: SETTING_MODE_KEY, value: mode },
    });
  } catch (err) {
    console.error('saveProfileImageAction failed:', err);
    return {
      ok: false,
      error: 'Could not save the image. The database write failed.',
    };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/profile-image');

  return {
    ok: true,
    message: 'Profile image updated.',
    version: hashBytes(bytes),
  };
}

/**
 * Save only the crop/position, for when the admin wants to reframe the
 * existing portrait without re-uploading it.
 */
const positionSchema = z.object({
  position: z
    .string()
    .regex(
      /^(\d{1,3})%\s+(\d{1,3})%$/,
      'Must be a pair of percentages, e.g. "50% 30%"',
    )
    .max(32),
});

export async function saveProfilePositionAction(
  _prev: ProfileImageState,
  formData: FormData,
): Promise<ProfileImageState> {
  if (!(await requireAdmin())) {
    return { ok: false, error: 'Not authorized.' };
  }

  const parsed = positionSchema.safeParse({
    position: String(formData.get('position') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Invalid position.' };
  }

  const position = parsePosition(parsed.data.position);

  try {
    await db.setting.upsert({
      where: { key: SETTING_POSITION_KEY },
      update: { value: position },
      create: { key: SETTING_POSITION_KEY, value: position },
    });
  } catch (err) {
    console.error('saveProfilePositionAction failed:', err);
    return { ok: false, error: 'Could not save the crop.' };
  }

  revalidatePath('/');
  revalidatePath('/admin');

  return { ok: true, message: 'Crop saved.' };
}

/**
 * Clear the stored portrait and fall back to the shipped default
 * (/images/profile-cutout.png).
 */
export async function restoreDefaultProfileImageAction(
  _prev: ProfileImageState,
  _formData: FormData,
): Promise<ProfileImageState> {
  if (!(await requireAdmin())) {
    return { ok: false, error: 'Not authorized.' };
  }

  try {
    await db.setting.upsert({
      where: { key: SETTING_IMAGE_KEY },
      update: { value: '' },
      create: { key: SETTING_IMAGE_KEY, value: '' },
    });
    await db.setting.upsert({
      where: { key: SETTING_POSITION_KEY },
      update: { value: '50% 30%' },
      create: { key: SETTING_POSITION_KEY, value: '50% 30%' },
    });
    // The shipped default is a cut-out PNG, so the mode returns to
    // `cutout` along with everything else.
    await db.setting.upsert({
      where: { key: SETTING_HAS_ALPHA_KEY },
      update: { value: 'true' },
      create: { key: SETTING_HAS_ALPHA_KEY, value: 'true' },
    });
    await db.setting.upsert({
      where: { key: SETTING_IS_SET_KEY },
      update: { value: 'false' },
      create: { key: SETTING_IS_SET_KEY, value: 'false' },
    });
    await db.setting.upsert({
      where: { key: SETTING_MODE_KEY },
      update: { value: '' },
      create: { key: SETTING_MODE_KEY, value: '' },
    });
  } catch (err) {
    console.error('restoreDefaultProfileImageAction failed:', err);
    return { ok: false, error: 'Could not restore the default image.' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/profile-image');

  return { ok: true, message: 'Restored the default portrait.' };
}

/**
 * Only the percentage form is accepted so the admin UI can render the
 * value straight back into a slider without parsing CSS. Values outside
 * 0–100 are clamped; a value that isn't in the percentage form at all
 * falls back to the default crop.
 */
function parsePosition(raw: FormDataEntryValue | null): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  const match = /^(\d{1,3})%\s+(\d{1,3})%$/.exec(value);
  if (!match) return '50% 30%';
  const x = Math.max(0, Math.min(100, Number(match[1])));
  const y = Math.max(0, Math.min(100, Number(match[2])));
  return `${x}% ${y}%`;
}

/**
 * An explicit render-mode override from the admin panel. An empty
 * value means "use the detected mode".
 */
function parseMode(raw: FormDataEntryValue | null): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (value === 'cutout' || value === 'photo') return value;
  return '';
}
