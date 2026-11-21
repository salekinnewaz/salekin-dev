'use client';

import { useState } from 'react';
import { ResumeModal } from './ResumeModal';

const EMAIL = 'salekinnewaz0@gmail.com';
const PHONE = '+880 1640-8369595';
const LINKEDIN = 'https://www.linkedin.com/in/md-salekin-newaz';
const GITHUB = 'https://github.com/salekin-newaz';

/**
 * Footer — a single hairline-separated row.
 *
 * The previous footer was a stacked two-line block duplicated between
 * `app/layout.tsx` and `components/site/Footer.tsx`. The refactor keeps
 * one component, rendered once from the layout, and collapses it into a
 * single row: identity on the left, contact handles and social links on
 * the right.
 */
export function Footer() {
  const [showResume, setShowResume] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-3 px-5 py-5 sm:px-6 md:flex-row md:gap-6">
        {/* Identity */}
        <p className="font-mono text-[0.7rem] text-[var(--color-muted)]">
          © {year}{' '}
          <span className="text-[var(--color-fg-2)]">Md Salekin Newaz</span>
        </p>

        {/* Links */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-1 font-mono text-[0.7rem] text-[var(--color-muted)]"
        >
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex min-h-8 items-center rounded-md px-2 transition-colors hover:text-[var(--color-accent)]"
          >
            {EMAIL}
          </a>
          <a
            href="tel:+88016408369595"
            className="inline-flex min-h-8 items-center rounded-md px-2 transition-colors hover:text-[var(--color-accent)]"
          >
            {PHONE}
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center rounded-md px-2 transition-colors hover:text-[var(--color-accent)]"
          >
            LinkedIn
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center rounded-md px-2 transition-colors hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={() => setShowResume(true)}
            className="inline-flex min-h-8 items-center rounded-md px-2 transition-colors hover:text-[var(--color-accent)]"
          >
            Resume
          </button>
        </nav>
      </div>

      {showResume ? <ResumeModal onClose={() => setShowResume(false)} /> : null}
    </footer>
  );
}
