'use server';

import { headers } from 'next/headers';
import { createContact } from '@/lib/queries/contacts';
import { safeParseContact } from '@/lib/validation/contact';
import { checkRateLimit } from '@/lib/security/rate-limit';

/**
 * Result type for the contact form server action. Field-level errors live on
 * the client (via react-hook-form + zod resolver), so the server only signals
 * a top-level message.
 */
export type SubmitContactState =
  | { ok: true }
  | { ok: false; error: string };

/** Honeypot field. Bots fill it; humans don't see it. */
const HONEYPOT_FIELD = 'website';

/** Hard caps on field length to keep payloads sane. */
const MAX_NAME = 120;
const MAX_EMAIL = 240;
const MAX_MESSAGE = 4000;

/** Per-IP limits: 5 submissions per hour, burst-tolerant within reason. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

async function clientIp(): Promise<string> {
  // Works in dev and behind common reverse proxies. Deployment note: this
  // trusts x-forwarded-for as set by your proxy; if your edge doesn't strip
  // client-supplied XFF, malicious callers can spoof their IP to dodge the
  // per-IP rate limit. Use the rightmost trusted hop for your chain.
  const h = await headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'
  );
}

/**
 * Extract a typed payload from a FormData payload submitted by the contact form.
 * Unknown fields are ignored. Returns null when the FormData is missing one of
 * the expected entries (treated as invalid).
 */
function readFormData(formData: FormData): {
  name: string;
  email: string;
  message: string;
} | null {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  if (typeof name !== 'string') return null;
  if (typeof email !== 'string') return null;
  if (typeof message !== 'string') return null;
  return { name, email, message };
}

/**
 * Server Action backing the public contact form.
 *
 * Compatible with React 19's `useActionState`: takes the previous state plus
 * the submitted FormData and returns the next state. It also works as a plain
 * `<form action={...}>` POST handler when JavaScript is disabled.
 *
 * The server only returns a top-level error string. Field-level validation
 * errors are surfaced client-side by react-hook-form using the shared zod
 * schema in `@/lib/validation/contact`.
 *
 * Defenses:
 *   - Honeypot field: bots tend to fill all visible fields; humans never see
 *     this one. If filled, silently drop the submission.
 *   - Per-IP rate limit: max 5 / hour.
 *   - Length caps: refuse payloads over MAX_* bytes.
 */
export async function submitContactAction(
  _prevState: SubmitContactState,
  formData: FormData,
): Promise<SubmitContactState> {
  // Honeypot — silently reject. Same response shape as a real submit so bots
  // can't easily distinguish. We just don't persist anything.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { ok: true };
  }

  // Per-IP rate limit
  const ip = await clientIp();
  const limit = checkRateLimit(`contact:${ip}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfterMs / 60000);
    return {
      ok: false,
      error: `Too many submissions. Try again in ${minutes} min.`,
    };
  }

  const parsed = readFormData(formData);
  if (parsed === null) {
    return { ok: false, error: 'Please check the fields and try again.' };
  }

  // Length caps (defense in depth — zod also enforces these).
  if (
    parsed.name.length > MAX_NAME ||
    parsed.email.length > MAX_EMAIL ||
    parsed.message.length > MAX_MESSAGE
  ) {
    return { ok: false, error: 'Submission too long. Please shorten it.' };
  }

  const validated = safeParseContact(parsed);
  if (!validated.success) {
    return { ok: false, error: 'Please check the fields and try again.' };
  }

  try {
    const result = await createContact(validated.data);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}