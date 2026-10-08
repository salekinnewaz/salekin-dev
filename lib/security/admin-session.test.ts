import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// We need the env module to be importable, so load it lazily inside each test.
// For unit tests of pure session logic, we mock process.env directly.
describe('security/admin-session', () => {
  const ORIGINAL_ENV = { ...process.env };
  beforeEach(() => {
    // Reset to a known admin + secret
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
    return import('./admin-session');
  }

  it('isAdminConfigured() respects the env flag', async () => {
    process.env.ADMIN_PASSWORD = 'set';
    const a = await load();
    expect(a.isAdminConfigured()).toBe(true);

    process.env.ADMIN_PASSWORD = '';
    vi.resetModules();
    const b = await load();
    expect(b.isAdminConfigured()).toBe(false);
  });

  it('isValidAdminPassword does constant-ish work and rejects wrong/empty', async () => {
    const { isValidAdminPassword } = await load();
    expect(isValidAdminPassword('pw-correct')).toBe(true);
    expect(isValidAdminPassword('wrong')).toBe(false);
    expect(isValidAdminPassword('')).toBe(false);
    expect(isValidAdminPassword('pw-correct-but-trailing')).toBe(false);
  });

  it('signed cookie round-trips through isAuthed', async () => {
    const { buildSessionCookieValue, isAuthed } = await load();
    const cookie = buildSessionCookieValue();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('lax');
    expect(cookie.secure).toBe(true);
    expect(cookie.maxAge).toBeGreaterThan(0);
    // Accepts the full Cookie header shape.
    expect(isAuthed(`${cookie.name}=${cookie.value}`)).toBe(true);
    // Accepts the bare value (what next/headers' cookies().get(name) returns).
    expect(isAuthed(cookie.value)).toBe(true);
  });

  it('rejects a cookie with a tampered signature', async () => {
    const { buildSessionCookieValue, isAuthed } = await load();
    const cookie = buildSessionCookieValue();
    const [payload, sig] = cookie.value.split('.');
    if (!payload || !sig) throw new Error('cookie did not split as expected');
    // Flip a character in the middle of the signature. Doing this at a
    // fixed offset (not the last char) keeps the test deterministic — the
    // last-char approach depended on the random signature not happening to
    // end in the replacement byte.
    const mid = Math.floor(sig.length / 2);
    const original = sig[mid];
    const replacement = original === 'A' ? 'B' : 'A';
    const tampered = `${payload}.${sig.slice(0, mid)}${replacement}${sig.slice(mid + 1)}`;
    expect(tampered).not.toBe(sig);
    expect(isAuthed(`admin_session=${tampered}`)).toBe(false);
  });

  it('rejects a signature padded by out-of-alphabet chars', async () => {
    // Buffer.from('base64') silently strips '-' / '_' and trailing junk, so
    // a naive decode-then-compare would accept a signature like
    // `<valid><padding>`. Verify the gate rejects that shape.
    const { buildSessionCookieValue, isAuthed } = await load();
    const cookie = buildSessionCookieValue();
    const [payload, sig] = cookie.value.split('.');
    if (!payload || !sig) throw new Error('cookie did not split as expected');
    const padded = `${payload}.${sig}===`;
    expect(isAuthed(`admin_session=${padded}`)).toBe(false);
    const dashed = `${payload}.${sig.slice(0, -2)}--`;
    expect(isAuthed(`admin_session=${dashed}`)).toBe(false);
  });

  it('rejects an expired cookie', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const a = await load();
      const cookie = a.buildSessionCookieValue();
      expect(a.isAuthed(`admin_session=${cookie.value}`)).toBe(true);

      // Jump past the 12h TTL.
      vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));
      vi.resetModules();
      const b = await load();
      expect(b.isAuthed(`admin_session=${cookie.value}`)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects a malformed cookie value', async () => {
    const { isAuthed } = await load();
    expect(isAuthed(null)).toBe(false);
    expect(isAuthed('')).toBe(false);
    expect(isAuthed('admin_session=garbage')).toBe(false);
    expect(isAuthed('admin_session=')).toBe(false);
  });

  it('clearSessionCookie returns a maxAge=0 cookie', async () => {
    const { clearSessionCookie } = await load();
    const c = clearSessionCookie();
    expect(c.maxAge).toBe(0);
    expect(c.value).toBe('');
  });

  it('requires ADMIN_SESSION_SECRET in production when password is set', async () => {
    process.env.ADMIN_PASSWORD = 'set';
    process.env.ADMIN_SESSION_SECRET = '';
    (process.env as Record<string, string>).NODE_ENV = 'production';
    vi.resetModules();
    const { buildSessionCookieValue } = await load();
    expect(() => buildSessionCookieValue()).toThrow(/SESSION_SECRET/);
  });

  it('requires ADMIN_SESSION_SECRET >= 16 chars in production when password is set', async () => {
    process.env.ADMIN_PASSWORD = 'set';
    process.env.ADMIN_SESSION_SECRET = 'too-short';
    (process.env as Record<string, string>).NODE_ENV = 'production';
    vi.resetModules();
    const { buildSessionCookieValue } = await load();
    expect(() => buildSessionCookieValue()).toThrow(/SESSION_SECRET/);
  });

  it('falls back to the password as the HMAC key in non-production when no session secret exists', async () => {
    process.env.ADMIN_PASSWORD = 'pw-correct';
    process.env.ADMIN_SESSION_SECRET = '';
    (process.env as Record<string, string>).NODE_ENV = 'development';
    vi.resetModules();
    const { buildSessionCookieValue, isAuthed } = await load();
    const cookie = buildSessionCookieValue();
    // Cookie signs with the password as the HMAC key in dev.
    expect(isAuthed(`admin_session=${cookie.value}`)).toBe(true);
  });
});