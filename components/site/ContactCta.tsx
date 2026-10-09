import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';

type ContactCtaProps = {
  identity: SiteIdentity;
};

/**
 * ContactCta — split from the old ContactSection.
 *
 *  - Eyebrow: "Let's Connect"
 *  - H2: "Get In Touch"
 *  - 3 contact lines: location, email, phone + social icons row
 *  - On the right: a small "Open to interesting opportunities and
 *    collaborations" message card with envelope icon, then a
 *    "Send a Message" primary gradient button → `#contact` (the
 *    form section below).
 *
 * The form is in ContactFormSection, not here.
 */
export function ContactCta({ identity }: ContactCtaProps) {
  return (
    <section className="section-anchor relative py-20 sm:py-28">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-5 reveal">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Let&apos;s Connect
          </span>
          <h2 className="heading-display heading-underline text-4xl sm:text-5xl">
            Get In Touch
          </h2>
          <p className="max-w-md text-sm text-fg-2 sm:text-base text-pretty">
            Have a QA challenge, an automation gap, or a release-readiness
            question? I&apos;d love to hear about it.
          </p>

          <ul className="mt-2 flex flex-col gap-3">
            {identity.contactLocation ? (
              <li className="flex items-center gap-3 text-sm text-fg-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </span>
                <span>{identity.contactLocation}</span>
              </li>
            ) : null}
            {identity.contactEmail ? (
              <li className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <a
                  href={`mailto:${identity.contactEmail}`}
                  className="text-fg-2 transition-colors hover:text-accent"
                >
                  {identity.contactEmail}
                </a>
              </li>
            ) : null}
            {identity.contactPhone ? (
              <li className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
                  </svg>
                </span>
                <a
                  href={`tel:${identity.contactPhone.replace(/\s+/g, '')}`}
                  className="text-fg-2 transition-colors hover:text-accent"
                >
                  {identity.contactPhone}
                </a>
              </li>
            ) : null}
          </ul>

          <ul className="mt-3 flex flex-wrap items-center gap-2">
            {identity.socialGithub ? (
              <li>
                <a
                  href={identity.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.1-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                </a>
              </li>
            ) : null}
            {identity.socialLinkedin ? (
              <li>
                <a
                  href={identity.socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V10.5H5.67v7.84h2.67zm-1.34-9c.85 0 1.54-.7 1.54-1.55a1.54 1.54 0 1 0-3.08 0c0 .85.69 1.55 1.54 1.55zm11.34 9v-4.59c0-2.19-.45-3.84-3-3.84-1.21 0-2.03.66-2.37 1.3h-.04V10.5h-2.55v7.84h2.66v-3.88c0-1.02.2-2 1.46-2s1.27 1.16 1.27 2.07v3.81h2.57z" />
                  </svg>
                </a>
              </li>
            ) : null}
            {identity.contactEmail ? (
              <li>
                <a
                  href={`mailto:${identity.contactEmail}`}
                  aria-label="Email"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="reveal">
          <div className="card flex flex-col gap-5 p-6 sm:p-7">
            <span
              aria-hidden="true"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <p className="text-lg font-semibold text-fg sm:text-xl">
              Open to interesting opportunities and collaborations.
            </p>
            <p className="text-sm text-fg-2 text-pretty">
              Send a note and I&apos;ll reply within a day or two.
            </p>
            <Link
              href="#contact"
              className="btn-primary self-start"
            >
              Send a Message
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
