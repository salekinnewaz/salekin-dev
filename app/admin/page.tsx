import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/queries/site';
import { listContacts } from '@/lib/queries/contacts';
import { countCvDownloads } from '@/lib/queries/cv-downloads';
import {
  isAdminConfigured,
  isAuthed,
} from '@/lib/security/admin-session';
import { env } from '@/lib/env';
import { AdminForm } from './AdminForm';
import { AdminMessages } from './AdminMessages';
import { adminLogoutAction } from '@/lib/actions/admin';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Gate: redirect to /admin/login when configured + unauthenticated. In
  // production, fail closed if admin is not configured at all so the page
  // can't be probed by anonymous callers.
  if (!isAdminConfigured()) {
    if (env.NODE_ENV === 'production') notFound();
  } else {
    const c = await cookies();
    if (!isAuthed(c.get('admin_session')?.value)) {
      redirect('/admin/login');
    }
  }

  const [site, contacts, downloads] = await Promise.all([
    getSiteSettings(),
    listContacts(50),
    countCvDownloads(),
  ]);

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 py-12">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Internal · noindex</span>
          <div className="flex items-center gap-5">
            <a
              href="/admin/export"
              className="font-mono text-xs uppercase tracking-widest text-muted hover:text-accent"
              title="Download a JSON snapshot of every table"
            >
              export data
            </a>
            {isAdminConfigured() ? (
              <form action={adminLogoutAction}>
                <button
                  type="submit"
                  className="font-mono text-xs uppercase tracking-widest text-muted hover:text-accent"
                >
                  sign out
                </button>
              </form>
            ) : null}
          </div>
        </div>
        <h1 className="heading-display heading-gradient text-4xl sm:text-5xl">
          Site settings
        </h1>
        <p className="max-w-prose text-fg-2">
          Edit the copy, theme, sections, and skills that drive the public site.
          All changes are persisted to the database and reflected on the home page
          immediately.
        </p>
      </header>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Sections visible" value={
          Object.values(site.sections).filter(Boolean).length
        } />
        <Stat label="CV downloads" value={downloads} />
        <Stat
          label="Unread messages"
          value={unread}
          accent={unread > 0}
        />
      </section>

      <AdminForm
        defaults={{
          identity: {
            siteTitle: site.identity.siteTitle,
            siteTagline: site.identity.siteTagline,
            siteSubtitle: site.identity.siteSubtitle,
            siteInitials: site.identity.siteInitials,
            aboutBio: site.identity.aboutBio,
            contactEmail: site.identity.contactEmail ?? '',
            contactPhone: site.identity.contactPhone ?? '',
            contactLocation: site.identity.contactLocation ?? '',
            cvUrl: site.identity.cvUrl,
            socialGithub: site.identity.socialGithub ?? '',
            socialLinkedin: site.identity.socialLinkedin ?? '',
            socialFacebook: site.identity.socialFacebook ?? '',
            socialX: site.identity.socialX ?? '',
          },
          sections: site.sections,
          theme: {
            accentColor: site.theme.accentColor,
            accentColor2: site.theme.accentColor2,
            defaultTheme: site.theme.defaultTheme,
          },
          skills: site.skills,
          stats: site.stats,
        }}
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="heading-display text-2xl">Contact submissions</h2>
          <span className="font-mono text-xs text-accent">
            {contacts.length} total
          </span>
        </div>
        <AdminMessages
          messages={contacts.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            message: c.message,
            createdAt: c.createdAt.toISOString(),
            read: c.read,
          }))}
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="glass-card p-5">
      <p
        className={
          'heading-display text-3xl ' +
          (accent ? 'text-accent' : 'text-fg')
        }
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </p>
    </div>
  );
}