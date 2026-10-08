import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  isAdminConfigured,
  isAuthed,
} from '@/lib/security/admin-session';
import { buildDataExport } from '@/lib/queries/export';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/export
 *
 * Streams a JSON snapshot of every table as an attachment. Gate mirrors the
 * `/admin` page: redirect to /admin/login when configured + unauthenticated.
 *
 * Production hardening: in production, refuse to serve the snapshot if admin
 * is not configured (no password). Without this, an empty ADMIN_PASSWORD in
 * a misconfigured prod environment would expose the entire DB — including
 * CvDownload rows containing visitor IPs — to anonymous callers.
 */
export async function GET() {
  if (!isAdminConfigured()) {
    if (env.NODE_ENV === 'production') {
      return new Response('Admin not configured', { status: 404 });
    }
    // Dev / preview: no gate, hand over the snapshot.
  } else {
    const c = await cookies();
    if (!isAuthed(c.get('admin_session')?.value)) {
      redirect('/admin/login');
    }
  }

  const snapshot = await buildDataExport();

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace(/T/, '_')
    .slice(0, 19);
  const filename = `specMd-backup-${stamp}.json`;

  return new Response(JSON.stringify(snapshot, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
}