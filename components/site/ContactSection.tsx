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
 * Contact — calm final section. Plain heading, single line of copy,
 * the form, then three social buttons. The previous iteration had a
 * `$ open --new /contact` terminal prefix, an "Open to" chip row,
 * and a verbose email/phone/location bullet list — all removed.
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
            <span aria-hidden="true" className="text-accent-2">$</span>{' '}
            contact --new
          </span>
          <h2 className="heading-display text-4xl sm:text-5xl">
            Let&apos;s build something
          </h2>
          <p className="max-w-md text-base leading-relaxed text-fg-2 text-pretty sm:text-lg">
            Have a product, an engineering problem, or an interesting
            opportunity? Send a note — I read everything and reply
            within a day or two.
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
                  className="btn-outline"
                >
                  {l.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="reveal">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
