import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for the profile-image server actions.
 *
 * These cover the two things that must never regress:
 *   1. The authorisation gate. A Server Action is a public HTTP
 *      endpoint, so `requireAdmin()` has to reject an anonymous
 *      caller before anything touches the database — and it must do so
 *      even when the uploaded file is perfectly valid.
 *   2. The file validation. The browser-reported MIME type is only a
 *      hint; the real check is the magic-byte sniff.
 */

const cookieStore = new Map<string, { name: string; value: string }>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    set: (cookie: { name: string; value: string }) => {
      cookieStore.set(cookie.name, cookie);
    },
    get: (name: string) => cookieStore.get(name),
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  })),
  headers: vi.fn(async () => ({ get: () => null })),
}));

const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }));

const upsert = vi.fn(
  async (..._args: unknown[]) => ({ key: 'profile_image', value: 'x' }),
);
vi.mock('@/lib/db', () => ({
  db: {
    setting: {
      upsert: (...args: unknown[]) => upsert(...args),
      findMany: vi.fn(async () => []),
    },
  },
}));

const ORIGINAL_ENV = { ...process.env };

// A 1×1 PNG.
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function fileForm(
  bytes: Buffer,
  mime: string,
  name = 'portrait.png',
  position = '50% 30%',
): FormData {
  const fd = new FormData();
  fd.set(
    'profileImage',
    new File([new Uint8Array(bytes)], name, { type: mime }),
  );
  fd.set('position', position);
  return fd;
}

describe('actions/profile-image', () => {
  beforeEach(() => {
    cookieStore.clear();
    upsert.mockClear();
    revalidatePath.mockClear();
    process.env.ADMIN_PASSWORD = 'pw-correct';
    process.env.ADMIN_SESSION_SECRET = 'a-secret-with-at-least-sixteen-chars';
    (process.env as Record<string, string>).NODE_ENV = 'production';
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  async function load() {
    return import('./profile-image');
  }

  /** Plant a valid signed admin session cookie. */
  async function authedCookie() {
    const { buildSessionCookieValue } = await import('@/lib/security/admin-session');
    const c = buildSessionCookieValue();
    cookieStore.set(c.name, { name: c.name, value: c.value });
  }

  it('rejects an unauthenticated upload before touching the database', async () => {
    const { saveProfileImageAction } = await load();
    const r = await saveProfileImageAction(
      { ok: false, error: '' },
      fileForm(PNG_BYTES, 'image/png'),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not authorized/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated restore-default', async () => {
    const { restoreDefaultProfileImageAction } = await load();
    const r = await restoreDefaultProfileImageAction({ ok: false, error: '' }, new FormData());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not authorized/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated crop save', async () => {
    const { saveProfilePositionAction } = await load();
    const fd = new FormData();
    fd.set('position', '20% 40%');
    const r = await saveProfilePositionAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not authorized/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('accepts a valid PNG from an authenticated admin', async () => {
    await authedCookie();
    const { saveProfileImageAction } = await load();
    const r = await saveProfileImageAction(
      { ok: false, error: '' },
      fileForm(PNG_BYTES, 'image/png'),
    );
    expect(r.ok).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(2);
    // The image is stored as a data URI so it survives redeploys.
    const imageWrite = upsert.mock.calls.find(
      (c) => (c[0] as { where: { key: string } }).where.key === 'profile_image',
    );
    const value = (imageWrite?.[0] as { create: { value: string } }).create.value;
    expect(value.startsWith('data:image/png;base64,')).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('rejects a file whose bytes are not a real image', async () => {
    await authedCookie();
    const { saveProfileImageAction } = await load();
    const notAnImage = Buffer.from('<?php echo "pwned"; ?>', 'utf8');
    const r = await saveProfileImageAction(
      { ok: false, error: '' },
      fileForm(notAnImage, 'image/png'),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not a valid/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects a file whose declared type contradicts its bytes', async () => {
    await authedCookie();
    const { saveProfileImageAction } = await load();
    // Real PNG bytes, but declared as a JPEG.
    const r = await saveProfileImageAction(
      { ok: false, error: '' },
      fileForm(PNG_BYTES, 'image/jpeg', 'portrait.jpg'),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/do not match its type/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects an unsupported MIME type', async () => {
    await authedCookie();
    const { saveProfileImageAction } = await load();
    const fd = new FormData();
    fd.set('profileImage', new File([new Uint8Array(PNG_BYTES)], 'x.svg', { type: 'image/svg+xml' }));
    fd.set('position', '50% 30%');
    const r = await saveProfileImageAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/unsupported file type/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects a file over the 5 MB limit', async () => {
    await authedCookie();
    const { saveProfileImageAction } = await load();
    // 6 MB of PNG-signature bytes — passes the sniff, fails the size cap.
    const big = Buffer.concat([
      PNG_BYTES,
      Buffer.alloc(6 * 1024 * 1024, 0),
    ]);
    const r = await saveProfileImageAction(
      { ok: false, error: '' },
      fileForm(big, 'image/png'),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/too large/i);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects a request with no file at all', async () => {
    await authedCookie();
    const { saveProfileImageAction } = await load();
    const fd = new FormData();
    fd.set('position', '50% 30%');
    const r = await saveProfileImageAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/choose an image/i);
  });

  it('clamps an out-of-range crop position', async () => {
    await authedCookie();
    const { saveProfilePositionAction } = await load();
    const fd = new FormData();
    fd.set('position', '500% 999%');
    const r = await saveProfilePositionAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(true);
    const write = upsert.mock.calls[0]?.[0] as { create: { value: string } };
    expect(write.create.value).toBe('100% 100%');
  });

  it('rejects a malformed crop position', async () => {
    await authedCookie();
    const { saveProfilePositionAction } = await load();
    const fd = new FormData();
    fd.set('position', 'center');
    const r = await saveProfilePositionAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/invalid position/i);
  });

  it('restores the default portrait from an authenticated admin', async () => {
    await authedCookie();
    const { restoreDefaultProfileImageAction } = await load();
    const r = await restoreDefaultProfileImageAction({ ok: false, error: '' }, new FormData());
    expect(r.ok).toBe(true);
    const write = upsert.mock.calls.find(
      (c) => (c[0] as { where: { key: string } }).where.key === 'profile_image',
    );
    const value = (write?.[0] as { create: { value: string } }).create.value;
    expect(value).toBe('');
  });
});
