import type { EducationItem } from '@/lib/queries/education';

/**
 * Education & Certifications — per brief §13–§18.
 *
 * Hierarchy (deliberately non-equal):
 *  1. ISTQB® Certified — primary, visually prominent
 *  2. 4 secondary trainings (compact row of tags)
 *  3. BSc from the DB row (single row, not card)
 *  4. Digital Marketing — LEDP — 1-line quiet credit
 *  5. English — Professional Working Proficiency — 1-line quiet credit
 *
 * HSC / SSC / awards are deliberately omitted (not in brief).
 */

const SECONDARY_TRAININGS = [
  'IoT (Cisco Networking Academy)',
  'AWS Cloud Foundations (AWS Academy)',
  'Fundamentals of Deep Learning (NVIDIA DLI)',
  'GitHub Copilot for QA',
] as const;

type Props = {
  education: EducationItem[];
};

export function EducationCerts({ education }: Props) {
  return (
    <section
      id="education"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="mb-10 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Education · Certification
        </span>
        <h2 className="heading-display text-4xl sm:text-5xl">
          Education & Certifications
        </h2>
      </div>

      <ol className="flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border reveal-stagger">
        {/* 1. ISTQB® — primary */}
        <li className="flex flex-col gap-3 bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                Primary certification
              </p>
              <h3 className="heading-display text-2xl text-fg sm:text-3xl">
                ISTQB® Certified Tester — Foundation Level
              </h3>
              <p className="text-sm text-fg-2">International Software Testing Qualifications Board</p>
            </div>
            <span
              aria-hidden="true"
              className="font-mono text-xs uppercase tracking-widest text-muted"
            >
              verified
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-fg-2 text-pretty sm:text-base">
            Industry-standard foundation in test design, test techniques, test
            management and the software testing lifecycle — the baseline for
            every engagement I take on.
          </p>
        </li>

        {/* 2. Secondary trainings — quiet row */}
        <li className="flex flex-col gap-3 bg-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Other training
          </p>
          <ul className="flex flex-wrap gap-1.5" role="list">
            {SECONDARY_TRAININGS.map((t) => (
              <li key={t} role="listitem">
                <span className="tag">{t}</span>
              </li>
            ))}
          </ul>
        </li>

        {/* 3. BSc from DB */}
        {education.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-2 bg-card p-6 sm:p-8"
          >
            <div className="flex flex-col gap-1">
              <h3 className="heading-display text-xl text-fg sm:text-2xl">
                {e.degree}
              </h3>
              <p className="text-sm text-fg-2">{e.institution}</p>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {e.startYear} — {e.endYear}
            </p>
            {e.description ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-2 text-pretty">
                {e.description}
              </p>
            ) : null}
          </li>
        ))}

        {/* 4. Digital Marketing — quiet credit */}
        <li className="flex flex-col gap-1 bg-card p-6 sm:p-8">
          <p className="text-sm text-fg-2">
            Digital Marketing —{' '}
            <span className="text-fg">LEDP</span>
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            November 2020
          </p>
        </li>

        {/* 5. English — 1-line */}
        <li className="flex flex-col gap-1 bg-card p-6 sm:p-8">
          <p className="text-sm text-fg-2">
            English —{' '}
            <span className="text-fg">Professional Working Proficiency</span>
          </p>
        </li>
      </ol>
    </section>
  );
}
