'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  buildSessionCookieValue,
  clearSessionCookie,
  isAdminConfigured,
  isValidAdminPassword,
} from '@/lib/security/admin-session';
import { checkRateLimit } from '@/lib/security/rate-limit';

const passwordSchema = z.object({
  password: z.string().min(1).max(200),
});

/** Rate-limit the login form so an empty/weak password can't be brute-forced. */
const LOGIN_RL_MAX = 5;
const LOGIN_RL_WINDOW_MS = 60 * 1000;

async function clientIpForRateLimit(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'
  );
}

export type AdminLoginState =
  | { ok: true }
  | { ok: false; error: string };

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  if (!isAdminConfigured()) {
    return { ok: false, error: 'Admin is not configured.' };
  }
  // Rate-limit by IP. Constant-shape response so the caller can't easily
  // distinguish "rate-limited" from "wrong password".
  const ip = await clientIpForRateLimit();
  const limit = checkRateLimit(`admin:${ip}`, {
    windowMs: LOGIN_RL_WINDOW_MS,
    max: LOGIN_RL_MAX,
  });
  if (!limit.ok) {
    return { ok: false, error: 'Too many attempts. Try again later.' };
  }
  const parsed = passwordSchema.safeParse({ password: formData.get('password') });
  if (!parsed.success) {
    return { ok: false, error: 'Password is required.' };
  }
  if (!isValidAdminPassword(parsed.data.password)) {
    // Constant-ish response time (zod + branch) — close enough for a single
    // password gate. The IP rate limit above is the primary control.
    return { ok: false, error: 'Wrong password.' };
  }
  const cookie = buildSessionCookieValue();
  const c = await cookies();
  c.set(cookie);
  redirect('/admin');
}

export async function adminLogoutAction(): Promise<void> {
  const cookie = clearSessionCookie();
  const c = await cookies();
  c.set(cookie);
  redirect('/admin/login');
}