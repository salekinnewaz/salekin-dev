/**
 * Signed-cookie session for /admin.
 *
 * The cookie value is `<expiry>.<HMAC-SHA256(expiry, secret)>` (base64url).
 * Anyone can read the expiry; only someone with the secret can forge a
 * valid signature. Cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in prod.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSigningSecret(): string {
  const secret = env.ADMIN_SESSION_SECRET;
  if (env.NODE_ENV === 'production' && env.ADMIN_PASSWORD) {
    // In production, a password without a dedicated session secret is unsafe:
    // anyone who learns the password can also forge cookies, because the
    // password would be the HMAC key. Fail closed.
    if (!secret || secret.length < 16) {
      throw new Error(
        'ADMIN_SESSION_SECRET must be at least 16 characters in production when /admin is gated.',
      );
    }
    return secret;
  }
  // Dev / preview: allow the password as the signing key, fall back to a
  // static dev-only secret if neither is set so the module still loads.
  return secret && secret.length >= 16
    ? secret
    : env.ADMIN_PASSWORD ?? 'dev-only-secret';
}

function b64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(value: string): string {
  return b64url(createHmac('sha256', getSigningSecret()).update(value).digest());
}

function verify(value: string, signature: string): boolean {
  const expected = sign(value);
  // Compare the base64url-encoded signatures in constant time. Decoding first
  // is unsafe: Buffer.from('base64') silently drops out-of-alphabet chars
  // like '-', '_', and trailing garbage, so two different signatures can
  // decode to the same bytes and pass a timingSafeEqual check.
  if (expected.length !== signature.length) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(signature)) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  // The /admin gate is on whenever a password is set. Without a password,
  // the route renders the form directly (handy for dev / previews).
  return Boolean(env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length > 0);
}

export function isValidAdminPassword(attempt: string): boolean {
  const expected = env.ADMIN_PASSWORD ?? '';
  if (!expected || attempt.length === 0) return false;
  if (attempt.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(attempt),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

export function buildSessionCookieValue(): {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: true;
  sameSite: 'lax';
  path: string;
  secure: boolean;
} {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = sign(payload);
  return {
    name: COOKIE_NAME,
    value: `${payload}.${sig}`,
    maxAge: SESSION_TTL_MS / 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: env.NODE_ENV === 'production',
  };
}

export function clearSessionCookie(): {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: true;
  sameSite: 'lax';
  path: string;
  secure: boolean;
} {
  return {
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: env.NODE_ENV === 'production',
  };
}

export function isAuthed(rawCookieHeader: string | null | undefined): boolean {
  if (!rawCookieHeader) return false;
  // Accept either a full Cookie header ("a=1; admin_session=xxx") or the bare
  // cookie value ("xxx") that next/headers' cookies().get(name) returns.
  let value = rawCookieHeader;
  if (rawCookieHeader.includes(`${COOKIE_NAME}=`)) {
    const target = rawCookieHeader
      .split(';')
      .map((s) => s.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!target) return false;
    value = target.slice(COOKIE_NAME.length + 1);
  }
  if (!value) return false;
  const dot = value.indexOf('.');
  if (dot === -1) return false;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!verify(payload, sig)) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return true;
}