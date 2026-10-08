import type { SiteIdentity } from '@/lib/queries/site';

type FooterProps = {
  identity: SiteIdentity;
};

type SocialLink = { href: string; label: string };

function socialLinks(identity: SiteIdentity): SocialLink[] {
  const out: SocialLink[] = [];
  if (identity.socialGithub) out.push({ href: identity.socialGithub, label: 'GitHub' });
  if (identity.socialLinkedin) out.push({ href: identity.socialLinkedin, label: 'LinkedIn' });
  if (identity.socialX) out.push({ href: identity.socialX, label: 'X' });
  return out;
}

export function Footer({ identity }: FooterProps) {
  const year = new Date().getFullYear();
  const links = socialLinks(identity);
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="text-accent">$</span>
          <span>© {year} {identity.siteTitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-muted">
          {identity.contactEmail ? (
            <a
              href={`mailto:${identity.contactEmail}`}
              className="hover:text-accent"
            >
              {identity.contactEmail}
            </a>
          ) : null}
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}