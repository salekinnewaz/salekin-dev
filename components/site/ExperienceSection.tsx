'use client';

import { useState } from 'react';
import { SectionHeader } from './SectionHeader';
import { SpotlightCard } from './SpotlightCard';
import {
  CAREER,
  CREDENTIALS,
  STACK_GROUPS,
} from '@/src/data/experience';

/**
 * ExperienceSection — module 04.
 *
 * Merges what used to be three separate sections (Experience timeline,
 * Credentials, Core Stack) into one 12-column frame:
 *
 *   Left (7 cols)  — the career timeline as an accordion. The current
 *                    role is expanded by default; older roles collapse.
 *   Right (5 cols) — the Verified Credentials card stacked on top of
 *                    the Core Technical Stack matrix.
 */
export function ExperienceSection() {
  const [openId, setOpenId] = useState<string | null>(
    CAREER.find((c) => c.defaultOpen)?.id ?? CAREER[0]?.id ?? null,
  );

  return (
    <section
      id="experience"
      tabIndex={-1}
      className="section-anchor relative py-14 lg:py-16"
    >
        <SectionHeader
          index="04"
          name="Experience"
          title="Where the work happened"
          description="Four years across five roles — from a QA internship to owning release sign-off for international clients."
        />

        <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* ─── Left — 7 cols: career timeline accordion ─── */}
          <div className="lg:col-span-7">
            <SpotlightCard className="h-full p-5 sm:p-6">
              <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                Career Timeline
              </h3>

              <ol className="mt-4 flex flex-col">
                {CAREER.map((entry, i) => {
                  const open = openId === entry.id;
                  const isLast = i === CAREER.length - 1;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : entry.id)}
                        aria-expanded={open}
                        aria-controls={`career-panel-${entry.id}`}
                        className="group flex w-full items-start gap-3 py-3 text-left"
                      >
                        {/* Timeline marker */}
                        <span className="relative mt-1 flex w-3 shrink-0 justify-center">
                          <span
                            aria-hidden="true"
                            className={`h-2.5 w-2.5 rounded-full ring-4 ring-[var(--color-card)] transition-colors ${
                              open
                                ? 'bg-[var(--color-accent)]'
                                : 'bg-[var(--color-border-strong)] group-hover:bg-[var(--color-accent)]'
                            }`}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-[0.95rem] font-bold tracking-tight text-[var(--color-fg)]">
                              {entry.role}
                            </span>
                            <span className="text-[0.82rem] text-[var(--color-accent)]">
                              {entry.company}
                            </span>
                          </span>
                          <span className="mt-0.5 block font-mono text-[0.66rem] text-[var(--color-muted)]">
                            {entry.period} · {entry.location}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={`mt-1 shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
                            open ? 'rotate-90' : ''
                          }`}
                        >
                          →
                        </span>
                      </button>

                      {open ? (
                        <div
                          id={`career-panel-${entry.id}`}
                          className="pb-4 pl-6"
                        >
                          <p className="text-[0.85rem] leading-relaxed text-[var(--color-fg-2)]">
                            {entry.summary}
                          </p>
                          <ul className="mt-2.5 flex flex-col gap-1.5">
                            {entry.bullets.map((b) => (
                              <li
                                key={b}
                                className="flex items-start gap-2 text-[0.82rem] leading-relaxed text-[var(--color-fg-2)]"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]"
                                />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {isLast ? null : (
                        <div
                          aria-hidden="true"
                          className="ml-[5px] h-3 border-l border-dashed border-[var(--color-border-strong)]"
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </SpotlightCard>
          </div>

          {/* ─── Right — 5 cols: credentials + stack ─── */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Verified credentials */}
            <SpotlightCard className="p-5 sm:p-6">
              <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                Verified Credentials
              </h3>

              <ul className="mt-4 flex flex-col gap-2">
                {CREDENTIALS.map((c) => (
                  <li
                    key={c.label}
                    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${
                      c.featured
                        ? 'border-[var(--color-accent)]/35 bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-2)]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.58rem] ${
                        c.featured
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-border-strong)]/30 text-[var(--color-muted)]'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-[0.82rem] font-semibold leading-snug ${
                          c.featured
                            ? 'text-[var(--color-fg)]'
                            : 'text-[var(--color-fg-2)]'
                        }`}
                      >
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-[0.68rem] leading-tight text-[var(--color-muted)]">
                        {c.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>

            {/* Core technical stack */}
            <SpotlightCard className="p-5 sm:p-6">
              <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                Core Technical Stack
              </h3>

              <dl className="mt-4 flex flex-col gap-3">
                {STACK_GROUPS.map((group) => (
                  <div
                    key={group.label}
                    className="border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      {group.label}
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {group.items.map((tech) => (
                        <span
                          key={tech}
                          className="mono-pill !text-[0.62rem]"
                        >
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </SpotlightCard>
          </div>
        </div>
    </section>
  );
}
