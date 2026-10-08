import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logCvDownload } from '@/lib/queries/cv-downloads';
import { getSiteSettings } from '@/lib/queries/site';
import { env } from '@/lib/env';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Per-IP rate limit for /cv-download. 30 hits/hour is plenty for a legitimate
 * visitor (and the crawlers following the link) while preventing disk-fill
 * attacks that spam the CvDownload table.
 */
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * GET /cv-download
 *
 * Records a download row then redirects to the actual CV file. Best-effort
 * tracking: a logging failure never blocks the download. The redirect
 * target is constrained so the route can't be used as an open redirect:
 *   - absolute URLs must point at this site (origin matches the request or
 *     env.SITE_URL),
 *   - anything else is treated as a same-origin path.
 */
export async function GET(req: Request) {
  // Per-IP rate limit. Runs before the DB write so a flood can't even
  // bloat the CvDownload table.
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown';
  const limit = checkRateLimit(`cv:${ip}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });
  if (!limit.ok) {
    return new NextResponse('Too many requests', {
      status: 429,
      headers: {
        'retry-after': String(Math.ceil(limit.retryAfterMs / 1000)),
      },
    });
  }

  const site = await getSiteSettings();
  const target = site.identity.cvUrl || '/Md_Salekin_Newaz.pdf';

  try {
    await logCvDownload({
      ip,
      userAgent: h.get('user-agent'),
      referer: h.get('referer'),
    });
  } catch (err) {
    console.error('cv-download tracking failed:', err);
  }

  // Build a same-origin redirect. Reject anything pointing off-site so this
  // route can't be used as an open redirect after a /admin compromise.
  const requestOrigin = new URL(req.url).origin;
  const allowedOrigin = env.SITE_URL ?? requestOrigin;
  let absolute: URL;
  try {
    const candidate = new URL(target);
    const sameOrigin =
      candidate.origin === requestOrigin || candidate.origin === allowedOrigin;
    absolute = sameOrigin ? candidate : new URL('/', allowedOrigin);
  } catch {
    // Relative path — anchor to the allowed origin.
    absolute = new URL(target, allowedOrigin);
  }
  return NextResponse.redirect(absolute);
}