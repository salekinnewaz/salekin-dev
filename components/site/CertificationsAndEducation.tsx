import type { Education } from '@prisma/client';

type EducationRow = Pick<
  Education,
  'id' | 'institution' | 'degree' | 'startYear' | 'endYear' | 'description'
>;

type Props = {
  education: EducationRow[];
};

/**
 * CertificationsAndEducation — replaces EducationCerts.
 *
 * Per the v3 brief, two side-by-side cards on the #0D1220 strip:
 *  - Certifications: ISTQB® Certified Tester as the headline card,
 *    then 4 secondary trainings as a clean bullet list
 *  - Education: B.Sc. in CSE from IIUC (2016–2020) + Digital
 *    Marketing LEDP as supporting entries
 *
 * Content is hard-coded; the only DB read is the education rows
 * (currently just one BSc row, but the loop supports more).
 */
const SECONDARY_TRAININGS = [
  'Agile Project Management',
  'Cyber Security (Phishing) — 2023',
  'Digital Assets Security & Privacy',
  'Cyber Security (Malware)',
  'Password Awareness — 2023',
] as const;

export function CertificationsAndEducation({ education }: Props) {
  return (
    <section
      id="certifications"
      tabIndex={-1}
      className="section-anchor relative bg-bg-2 py-20 sm:py-28"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Certifications card */}
        <div className="card flex flex-col gap-5 p-6 sm:p-7">
          <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="9" r="5" />
              <path d="M9 13l-2 8 5-3 5 3-2-8" />
            </svg>
            Certifications
          </span>
          <h3 className="heading-display text-2xl text-fg sm:text-3xl">
            ISTQB® Certified
          </h3>
          <p className="text-sm text-fg-2">
            Foundation Level — International Software Testing
            Qualifications Board.
          </p>
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Additional training
            </p>
            <ul className="flex flex-col gap-1.5 text-sm text-fg-2">
              {SECONDARY_TRAININGS.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Education card */}
        <div className="card flex flex-col gap-5 p-6 sm:p-7">
          <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 9l10-5 10 5-10 5z" />
              <path d="M6 11v5c2 1.5 4 2 6 2s4-.5 6-2v-5" />
              <path d="M22 9v6" />
            </svg>
            Education
          </span>
          {education.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {education.map((e) => (
                <li key={e.id} className="flex flex-col gap-1">
                  <h3 className="heading-display text-2xl text-fg sm:text-3xl">
                    {e.degree}
                  </h3>
                  <p className="text-sm text-fg-2">{e.institution}</p>
                  <p className="font-mono text-xs text-muted">
                    {e.startYear} – {e.endYear}
                  </p>
                  {e.description ? (
                    <p className="mt-1 text-sm text-fg-2 text-pretty">
                      {e.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              No education rows configured.
            </p>
          )}
          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Digital Marketing
            </p>
            <p className="text-sm text-fg-2">
              LEDP — Nov 2020
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
