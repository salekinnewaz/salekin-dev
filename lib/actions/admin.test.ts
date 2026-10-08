import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// next/navigation's redirect throws in the server runtime; mirror that here
// so the test can assert it was called without the action actually redirecting.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

// Test-controlled cookie + header stores.
const cookieStore = new Map<string, { name: string; value: string }>();
const headerStore = new Map<string, string>([['x-forwarded-for', '198.51.100.7']]);

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
  headers: vi.fn(async () => {
    const h = new Map<string, string>();
    for (const [k, v] of headerStore) h.set(k, v);
    return {
      get: (k: string) => h.get(k.toLowerCase()) ?? null,
    };
  }),
}));

import { redirect } from 'next/navigation';
import { adminLoginAction, adminLogoutAction } from './admin';
import { __resetRateLimitBucketsForTests } from '@/lib/security/rate-limit';

const ORIGINAL_ENV = { ...process.env };

describe('actions/admin', () => {
  beforeEach(() => {
    cookieStore.clear();
    headerStore.clear();
    headerStore.set('x-forwarded-for', '198.51.100.7');
    process.env.ADMIN_PASSWORD = 'pw-correct';
    process.env.ADMIN_SESSION_SECRET = 'a-secret-with-at-least-sixteen-chars';
    (process.env as Record<string, string>).NODE_ENV = 'production';
    vi.resetModules();
    __resetRateLimitBucketsForTests();
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  async function load() {
    return import('./admin');
  }

  function formWithPassword(pw: string): FormData {
    const fd = new FormData();
    fd.set('password', pw);
    return fd;
  }

  it('rejects when admin is not configured', async () => {
    process.env.ADMIN_PASSWORD = '';
    vi.resetModules();
    const { adminLoginAction } = await load();
    const r = await adminLoginAction({ ok: false, error: '' }, formWithPassword('whatever'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not configured/i);
  });

  it('rejects empty password', async () => {
    const { adminLoginAction } = await load();
    const r = await adminLoginAction({ ok: false, error: '' }, formWithPassword(''));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/required/i);
  });

  it('rejects wrong password', async () => {
    const { adminLoginAction } = await load();
    const r = await adminLoginAction({ ok: false, error: '' }, formWithPassword('nope'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/wrong password/i);
  });

  it('on correct password: sets a cookie and redirects to /admin', async () => {
    const { adminLoginAction } = await load();
    await expect(
      adminLoginAction({ ok: false, error: '' }, formWithPassword('pw-correct')),
    ).rejects.toThrow(/__redirect__:\/admin/);
    expect(cookieStore.get('admin_session')?.value).toBeTruthy();
  });

  it('rate-limits after 5 failed attempts within a minute', async () => {
    const { adminLoginAction } = await load();
    for (let i = 0; i < 5; i++) {
      const r = await adminLoginAction({ ok: false, error: '' }, formWithPassword('wrong'));
      expect(r.ok).toBe(false);
    }
    const r = await adminLoginAction({ ok: false, error: '' }, formWithPassword('wrong'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/too many/i);
  });

  it('logout clears the session cookie and redirects to /admin/login', async () => {
    // Plant a cookie to clear.
    cookieStore.set('admin_session', { name: 'admin_session', value: 'stub' });
    const { adminLogoutAction } = await load();
    await expect(adminLogoutAction()).rejects.toThrow(/__redirect__:\/admin\/login/);
    const cleared = cookieStore.get('admin_session');
    expect(cleared?.value).toBe('');
  });
});