import type { SiteIdentity } from '@/lib/queries/site';
import { ContactForm } from './ContactForm';

type ContactSectionProps = {
  identity: SiteIdentity;
};

type SocialLink = { href: string; label: string };

function socialLinks(identity: SiteIdentity): SocialLink[] {
  const out: SocialLink[] = [];
  if (identity.contactEmail) {
    out.push({
      href: `mailto:${identity.contactEmail}`,
      label: 'Email',
    });
  }
  if (identity.socialGithub) {
    out.push({ href: identity.socialGithub, label: 'GitHub' });
  }
  if (identity.socialLinkedin) {
    out.push({ href: identity.socialLinkedin, label: 'LinkedIn' });
  }
  return out;
}

/**
 * Contact — calm final section.
 *
 * - Single QA-framed intro line (no verbose bullet list, no terminal prefix)
 * - Three social buttons: Email, GitHub, LinkedIn (Facebook dropped —
 *   not in brief)
 * - Phone + location as a small quiet 1-line row beneath the buttons
 *   (per brief §16)
 */
export function ContactSection({ identity }: ContactSectionProps) {
  const links = socialLinks(identity);

  return (
    <section
      id="contact"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-6 reveal">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Contact
          </span>
          <h2 className="heading-display heading-underline text-4xl sm:text-5xl">
            Let&apos;s build something
          </h2>
          <p className="max-w-md text-base leading-relaxed text-fg-2 text-pretty sm:text-lg">
            Have a QA challenge, an automation gap, or a release-readiness
            question? Send a note — I read everything and reply within a
            day or two.
          </p>

          {links.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={
                    l.href.startsWith('mailto:')
                      ? undefined
                      : 'noopener noreferrer'
                  }
                  className="btn-outline group/contact"
                >
                  {l.label}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 ease-out group-hover/contact:translate-x-0.5 group-hover/contact:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
          ) : null}

          {(identity.contactPhone || identity.contactLocation) ? (
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              {identity.contactLocation ? (
                <span>{identity.contactLocation}</span>
              ) : null}
              {identity.contactPhone && identity.contactLocation ? (
                <span aria-hidden="true"> · </span>
              ) : null}
              {identity.contactPhone ? (
                <a
                  href={`tel:${identity.contactPhone.replace(/\s+/g, '')}`}
                  className="transition-colors hover:text-fg"
                >
                  {identity.contactPhone}
                </a>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="reveal">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
