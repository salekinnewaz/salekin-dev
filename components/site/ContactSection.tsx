import type { SiteIdentity } from '@/lib/queries/site';
import { ContactForm } from './ContactForm';

type ContactSectionProps = {
  identity: SiteIdentity;
};

type SocialLink = { href: string; label: string };

function socialLinks(identity: SiteIdentity): SocialLink[] {
  const out: SocialLink[] = [];
  if (identity.socialGithub) out.push({ href: identity.socialGithub, label: 'GitHub' });
  if (identity.socialLinkedin) out.push({ href: identity.socialLinkedin, label: 'LinkedIn' });
  if (identity.socialFacebook) out.push({ href: identity.socialFacebook, label: 'Facebook' });
  if (identity.socialX) out.push({ href: identity.socialX, label: 'X' });
  return out;
}

export function ContactSection({ identity }: ContactSectionProps) {
  const links = socialLinks(identity);

  return (
    <section
      id="contact"
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6 reveal">
          <span className="eyebrow">Get in touch</span>
          <h2 className="heading-display text-4xl sm:text-5xl">
            <span className="text-fg">Let&apos;s </span>
            <span className="heading-gradient">build something.</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-fg-2">
            Have a project, a role, or just want to talk shop? Drop a message —
            I read everything and reply within a day or two.
          </p>

          <ul className="mt-2 flex flex-col gap-3">
              {identity.contactEmail ? (
                <li className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card font-mono text-xs text-accent"
                    aria-hidden="true"
                  >
                    ✉
                  </span>
                  <a
                    href={`mailto:${identity.contactEmail}`}
                    className="font-mono text-sm text-fg hover:text-accent"
                  >
                    {identity.contactEmail}
                  </a>
                </li>
              ) : null}
              {identity.contactPhone ? (
                <li className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card font-mono text-xs text-accent"
                    aria-hidden="true"
                  >
                    ☎
                  </span>
                  <span className="font-mono text-sm text-fg">
                    {identity.contactPhone}
                  </span>
                </li>
              ) : null}
              {identity.contactLocation ? (
                <li className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card font-mono text-xs text-accent"
                    aria-hidden="true"
                  >
                    ◎
                  </span>
                  <span className="font-mono text-sm text-fg">
                    {identity.contactLocation}
                  </span>
                </li>
              ) : null}
            </ul>

          {links.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  {l.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="glass-card p-6 sm:p-8 reveal">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}