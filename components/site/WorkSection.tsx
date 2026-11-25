'use client';

import { useMemo, useState } from 'react';
import { SectionHeader } from './SectionHeader';
import { SpotlightCard } from './SpotlightCard';
import { CopyButton } from './CopyButton';
import {
  CASE_STUDIES,
  OSS_SPOTLIGHT,
  WORK_FILTERS,
  type CaseStudy,
  type WorkFilterId,
} from '@/src/data/projects';
import { CaseStudyModal } from './CaseStudyModal';

/**
 * WorkSection — module 02.
 *
 * Three parts:
 *   1. A full-width open-source spotlight for
 *      `playwright-summary-reporter`, with a copyable install command
 *      and a miniature GitHub Step Summary preview.
 *   2. A filter row (All / Open Source / Enterprise) that toggles
 *      which cards are shown.
 *   3. A 3-column grid of equal-height case study cards, each with a
 *      pinned "Read Case Study →" button that opens the modal.
 *
 * The OSS spotlight is always visible — it is the proof point for the
 * open-source work. The filter controls the case study grid below it.
 */
export function WorkSection() {
  const [filter, setFilter] = useState<WorkFilterId>('all');
  const [openCase, setOpenCase] = useState<CaseStudy | null>(null);

  const visibleCases = useMemo(() => {
    // The OSS spotlight is filtered separately; the enterprise grid
    // shows all three case studies under "All" and "Enterprise", and
    // nothing under "Open Source" (the spotlight covers it).
    if (filter === 'open-source') return [];
    return CASE_STUDIES;
  }, [filter]);

  return (
    <section
      id="work"
      tabIndex={-1}
      className="section-anchor relative py-14 lg:py-16"
    >
      <SectionHeader
        index="02"
        name="Featured Work"
        title="Open source and client engagements"
        description="A zero-dependency reporter used in production pipelines, and the QA work behind three international releases."
        actions={
          <div
            role="group"
            aria-label="Filter work"
            className="flex items-center gap-1.5"
          >
            {WORK_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                data-active={filter === f.id || undefined}
                className="filter-pill"
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      {/* ─── Open source spotlight ─── */}
      {filter === 'all' || filter === 'open-source' ? (
        <SpotlightCard className="gradient-border mt-7 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left — 7 cols */}
            <div className="flex flex-col p-5 sm:p-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-1.5">
                {OSS_SPOTLIGHT.badges.map((badge) => (
                  <span
                    key={badge}
                    className="mono-pill !border-[var(--color-accent)]/30 !bg-[var(--color-accent-soft)] !text-[var(--color-accent)]"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <h3 className="mt-3.5 font-mono text-lg font-semibold text-[var(--color-fg)] sm:text-xl">
                {OSS_SPOTLIGHT.name}
              </h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--color-fg-2)]">
                {OSS_SPOTLIGHT.tagline}
              </p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--color-muted)]">
                {OSS_SPOTLIGHT.description}
              </p>

              {/* Copyable install command */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-2.5">
                <code className="min-w-0 flex-1 truncate font-mono text-[0.76rem] text-[var(--color-fg-2)]">
                  {OSS_SPOTLIGHT.installCommand}
                </code>
                <CopyButton
                  value={OSS_SPOTLIGHT.installCommand}
                  variant="compact"
                  toastMessage="Install command copied"
                >
                  Copy
                </CopyButton>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={OSS_SPOTLIGHT.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={OSS_SPOTLIGHT.npmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  npm <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            {/* Right — 5 cols: miniature PR preview */}
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-2)] p-5 sm:p-6 lg:col-span-5 lg:border-l lg:border-t-0">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Step Summary · PR preview
              </p>
              <div className="mt-2.5 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
                <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] px-2.5 py-1.5">
                  <span aria-hidden="true" className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="ml-1 truncate font-mono text-[0.58rem] text-[var(--color-muted)]">
                    GITHUB_STEP_SUMMARY
                  </span>
                </div>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--color-muted)]">
                        Browser
                      </th>
                      <th className="px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--color-muted)]">
                        Pass
                      </th>
                      <th className="px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--color-muted)]">
                        Fail
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Chromium', '48', '0'],
                      ['WebKit', '48', '0'],
                      ['Mobile Safari', '32', '0'],
                    ].map(([browser, pass, fail]) => (
                      <tr
                        key={browser}
                        className="border-b border-[var(--color-border)] last:border-b-0"
                      >
                        <td className="px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--color-fg)]">
                          {browser}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--color-accent)]">
                          {pass}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--color-muted)]">
                          {fail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2.5 text-[0.7rem] leading-relaxed text-[var(--color-muted)]">
                No runtime dependencies — the reporter never enters your
                dependency graph.
              </p>
            </div>
          </div>
        </SpotlightCard>
      ) : null}

      {/* ─── Case study grid ─── */}
      {visibleCases.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCases.map((cs) => (
            <SpotlightCard
              key={cs.slug}
              className="flex h-full flex-col p-5"
            >
              <span className="mono-pill w-fit">{cs.category}</span>

              <h3 className="mt-3 text-[1.02rem] font-bold leading-snug tracking-tight text-[var(--color-fg)]">
                {cs.title}
              </h3>
              <p className="mt-1 text-[0.8rem] text-[var(--color-muted)]">
                {cs.subtitle}
              </p>
              <p className="mt-2.5 text-[0.85rem] leading-relaxed text-[var(--color-fg-2)]">
                {cs.summary}
              </p>

              {/* Impact metrics */}
              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {cs.metrics.slice(0, 2).map((m) => (
                  <div key={m.label} className="flex flex-col">
                    <dt className="font-mono text-[0.95rem] font-bold leading-none text-[var(--color-fg)]">
                      {m.value}
                    </dt>
                    <dd className="mt-1 text-[0.64rem] leading-tight text-[var(--color-muted)]">
                      {m.label}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Pinned footer */}
              <div className="bento-footer mt-4 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {cs.stack.slice(0, 2).map((tech) => (
                    <span key={tech} className="mono-pill !text-[0.6rem]">
                      {tech}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenCase(cs)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                >
                  Read Case Study <span aria-hidden="true">→</span>
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border-strong)] px-6 py-10 text-center">
          <p className="text-[0.9rem] text-[var(--color-fg-2)]">
            Open-source work is the spotlight above.
          </p>
          <p className="mt-1 text-[0.8rem] text-[var(--color-muted)]">
            Switch to <span className="text-[var(--color-accent)]">Enterprise</span>{' '}
            to see the client engagements.
          </p>
          <button
            type="button"
            onClick={() => setFilter('enterprise')}
            className="mt-4 rounded-lg border border-[var(--color-border)] px-3.5 py-1.5 text-[0.8rem] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Show Enterprise Work
          </button>
        </div>
      )}

      {openCase ? (
        <CaseStudyModal study={openCase} onClose={() => setOpenCase(null)} />
      ) : null}
    </section>
  );
}
