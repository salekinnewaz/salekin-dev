import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logCvDownload } from '@/lib/queries/cv-downloads';
import { getSiteSettings } from '@/lib/queries/site';
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
 * tracking: a logging failure never blocks the download.
 *
 * Redirect target rules (open-redirect protection):
 *   - The default `cvUrl` is a same-origin path ("/Md_Salekin_Newaz.pdf"),
 *     so the redirect anchors to the request's origin — i.e. the host the
 *     visitor actually came in on (Vercel subdomain, custom domain, or
 *     localhost in dev). We deliberately do NOT force the origin to
 *     env.SITE_URL: when a custom domain is configured but not yet wired
 *     up in DNS, anchoring to SITE_URL would 404 visitors even though
 *     the file is served fine on the host they reached.
 *   - If an admin sets `cvUrl` to an absolute URL, it must point at the
 *     request's own origin; anything off-site is dropped to "/" so this
 *     route can't be repurposed as an open redirect after /admin is
 *     compromised.
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

  // Resolve the redirect target against the request's own origin. If the
  // configured target is absolute, only honor it when it points at the
  // same origin the visitor is on — otherwise fall back to the home page
  // so the route can't be weaponized as an open redirect.
  const requestOrigin = new URL(req.url).origin;
  let absolute: URL;
  try {
    const candidate = new URL(target);
    absolute =
      candidate.origin === requestOrigin
        ? candidate
        : new URL('/', requestOrigin);
  } catch {
    // Relative path — anchor to the request's own origin.
    absolute = new URL(target, requestOrigin);
  }
  return NextResponse.redirect(absolute);
}