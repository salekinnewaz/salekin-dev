import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/queries/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /profile-image
 *
 * Serves the admin-managed portrait. The bytes live in the `Setting`
 * table as a base64 data URI (see lib/queries/site.ts), so this route
 * is the single public read path for the active portrait.
 *
 * Why a route instead of reading the data URI directly in the Hero:
 *   1. The Hero needs a normal `<img src>` so the browser gets a real
 *      HTTP cache entry — a 3 MB data URI inlined into the HTML would
 *      bloat every page payload and defeat caching entirely.
 *   2. Cache invalidation is a single URL change (`?v=<hash>`) rather
 *      than a full HTML revalidation for every visitor.
 *
 * Cache headers:
 *   - `ETag` is derived from the stored bytes, so a redeploy or a
 *     restore-to-default both produce a fresh validator.
 *   - `Cache-Control: public, max-age=0, must-revalidate` keeps the
 *     browser revalidating (cheap 304) so a newly uploaded portrait
 *     appears without a hard refresh.
 */
export async function GET() {
  const site = await getSiteSettings();
  const dataUri = site.profileImage.dataUri;

  // No managed portrait stored — fall back to the shipped default so
  // the <img> never 404s and the hero always shows something.
  if (!dataUri) {
    return new NextResponse(null, {
      status: 302,
      headers: { Location: '/images/profile.jpg' },
    });
  }

  const parsed = parseDataUri(dataUri);
  if (!parsed) {
    // Stored row is corrupt in a way the settings layer didn't catch.
    // Serve the default rather than a broken image.
    return new NextResponse(null, {
      status: 302,
      headers: { Location: '/images/profile.jpg' },
    });
  }

  const { bytes, mime } = parsed;
  const etag = `"${hashBytes(bytes)}"`;

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=0, must-revalidate',
      ETag: etag,
    },
  });
}

function parseDataUri(dataUri: string): { bytes: Buffer; mime: string } | null {
  const match = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,(.*)$/i.exec(dataUri);
  if (!match) return null;
  const mime = match[1]?.toLowerCase() ?? '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return null;
  const payload = match[2] ?? '';
  let bytes: Buffer;
  try {
    bytes = Buffer.from(payload, 'base64');
  } catch {
    return null;
  }
  if (bytes.byteLength === 0) return null;
  return { bytes, mime };
}

/**
 * FNV-1a 64-bit, rendered as hex. Not a security primitive — it only
 * needs to be a cheap, stable content hash for the ETag and the
 * cache-busting query string.
 */
function hashBytes(bytes: Buffer): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, '0');
}
