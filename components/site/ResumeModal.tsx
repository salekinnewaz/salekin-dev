'use client';

import { Modal } from '@/components/ui/Modal';
import {
  CAREER,
  CREDENTIALS,
  STACK_GROUPS,
} from '@/src/data/experience';

/**
 * ResumeModal — a printable, self-contained resume.
 *
 * The modal is a styled HTML document rather than an embedded PDF, so it
 * inherits the site's type scale and prints cleanly to A4. The shared
 * Modal shell supplies the Escape key, the backdrop click and the body
 * scroll lock.
 *
 * The "Download PDF" action points at the verified CV asset, which is
 * the canonical document — this modal is the readable, print-friendly
 * summary of the same facts.
 */

const RESUME_URL = '/Md_Salekin_Newaz.pdf';

const CONTACT = {
  email: 'salekinnewaz0@gmail.com',
  phone: '+880 1640-8369595',
  location: 'Dhaka, Bangladesh',
  linkedin: 'https://www.linkedin.com/in/md-salekin-newaz',
  github: 'https://github.com/salekin-newaz',
};

export function ResumeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      label="Resume — Md Salekin Newaz"
      className="max-w-3xl"
    >
      {/* ─── Header ─── */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-2)] px-5 py-5 pr-14 sm:px-7">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-[var(--color-fg)] sm:text-2xl">
          Md Salekin Newaz
        </h2>
        <p className="mt-1 text-[0.88rem] text-[var(--color-accent)]">
          Senior Software QA Engineer
        </p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.68rem] text-[var(--color-muted)]">
          <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--color-accent)]">
            {CONTACT.email}
          </a>
          <a href={`tel:+88016408369595`} className="hover:text-[var(--color-accent)]">
            {CONTACT.phone}
          </a>
          <span>{CONTACT.location}</span>
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            LinkedIn
          </a>
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-7">
        {/* Summary */}
        <section>
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Profile
          </h3>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[var(--color-fg-2)]">
            Senior Software QA Engineer with 5+ years across web, mobile,
            API and IoT products. ISTQB® Certified, delivering Playwright
            automation, AI-driven QA workflows and release sign-off for
            international clients in Norway, Canada and the USA.
          </p>
        </section>

        {/* Experience */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Experience
          </h3>
          <ol className="mt-2.5 flex flex-col gap-3">
            {CAREER.map((entry) => (
              <li
                key={entry.id}
                className="border-l border-[var(--color-border-strong)] pl-3.5"
              >
                <p className="text-[0.88rem] font-bold leading-snug tracking-tight text-[var(--color-fg)]">
                  {entry.role} — {entry.company}
                </p>
                <p className="mt-0.5 font-mono text-[0.66rem] text-[var(--color-muted)]">
                  {entry.period} · {entry.location}
                </p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--color-fg-2)]">
                  {entry.summary}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Credentials */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Credentials
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {CREDENTIALS.map((c) => (
              <li key={c.label} className="mono-pill">
                {c.label}
              </li>
            ))}
          </ul>
        </section>

        {/* Stack */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Technical Stack
          </h3>
          <dl className="mt-2 flex flex-col gap-2">
            {STACK_GROUPS.map((group) => (
              <div key={group.label} className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                  {group.label}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.items.map((tech) => (
                    <span key={tech} className="mono-pill !text-[0.6rem]">
                      {tech}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* ─── Footer ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-2)] px-5 py-4 sm:px-7">
        <p className="text-[0.78rem] text-[var(--color-muted)]">
          The canonical CV — print or save as PDF.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2 text-[0.85rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Print
          </button>
          <a
            href={RESUME_URL}
            download="Md_Salekin_Newaz.pdf"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-[0.85rem] font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Download PDF <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}
