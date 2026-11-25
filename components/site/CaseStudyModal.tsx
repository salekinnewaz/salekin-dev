'use client';

import { Modal } from '@/components/ui/Modal';
import type { CaseStudy } from '@/src/data/projects';
import { requestService } from '@/lib/site/service-selection';

/**
 * CaseStudyModal — the deep-dive view for a featured case study.
 *
 * Shows the impact metrics, the Challenge, the Approach and
 * Architecture bullet lists, and the stack tags. The closing CTA is
 * wired to the shared service channel so it preselects the matching
 * service pill in the contact form and scrolls there.
 */
export function CaseStudyModal({
  study,
  onClose,
}: {
  study: CaseStudy;
  onClose: () => void;
}) {
  return (
    <Modal open onClose={onClose} label={study.title}>
      {/* ─── Header ─── */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-2)] px-5 py-5 pr-14 sm:px-7">
        <span className="mono-pill">{study.category}</span>
        <h2 className="mt-2.5 text-xl font-bold leading-tight tracking-tight text-[var(--color-fg)] sm:text-2xl">
          {study.title}
        </h2>
        <p className="mt-1 text-[0.85rem] text-[var(--color-muted)]">
          {study.subtitle}
        </p>
      </div>

      {/* ─── Body ─── */}
      <div className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-7">
        {/* Impact metrics */}
        <dl className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] p-4 sm:grid-cols-3">
          {study.metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <dt className="font-mono text-xl font-bold leading-none text-[var(--color-accent)]">
                {m.value}
              </dt>
              <dd className="text-[0.72rem] leading-tight text-[var(--color-muted)]">
                {m.label}
              </dd>
            </div>
          ))}
        </dl>

        {/* Challenge */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Challenge
          </h3>
          <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[var(--color-fg-2)]">
            {study.challenge}
          </p>
        </section>

        {/* Approach */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Approach
          </h3>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {study.approach.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[0.88rem] leading-relaxed text-[var(--color-fg-2)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Architecture */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Architecture
          </h3>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {study.architecture.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[0.88rem] leading-relaxed text-[var(--color-fg-2)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent-2)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Stack */}
        <section className="mt-5">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Stack
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {study.stack.map((tech) => (
              <span key={tech} className="mono-pill">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Footer CTA ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-2)] px-5 py-4 sm:px-7">
        <p className="text-[0.8rem] text-[var(--color-muted)]">
          Want this level of rigour on your release?
        </p>
        <button
          type="button"
          onClick={() => {
            onClose();
            requestService('release-qa-lead');
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-[0.85rem] font-semibold text-white transition-[filter] hover:brightness-110"
        >
          Book QA Audit <span aria-hidden="true">→</span>
        </button>
      </div>
    </Modal>
  );
}
