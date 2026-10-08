import type { ExperienceItem as ExperienceItemType } from '@/lib/queries/experiences';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

type ExperienceRowProps = {
  experience: ExperienceItemType;
  index: number;
};

function ExperienceRow({ experience, index }: ExperienceRowProps) {
  const { company, role, startDate, endDate, description, bullets } =
    experience;
  const end = endDate ? formatMonthYear(endDate) : 'present';
  const isCurrent = endDate === null;
  const startYear = startDate.getUTCFullYear();

  return (
    <li className="relative flex flex-col gap-2 pl-8 sm:pl-10">
      <span
        className="timeline-dot absolute left-0 top-7 sm:left-0.5"
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="select-none font-mono text-sm font-semibold text-accent-2 sm:absolute sm:left-12 sm:top-7 sm:w-10 sm:text-right sm:text-xs"
      >
        {startYear}
      </span>

      <div className="flex flex-col gap-2 p-6 sm:p-7 sm:pl-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="heading-display text-xl text-fg sm:text-2xl">
              {role}
            </h3>
            <p className="text-sm text-fg-2">
              {company} · Dhaka, Bangladesh
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted">
            {isCurrent ? (
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span
                  className="relative inline-flex h-1.5 w-1.5"
                  aria-hidden="true"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                in progress
              </span>
            ) : null}
            <span>
              {formatMonthYear(startDate)} — {end}
            </span>
            <span
              className="hidden text-muted/60 sm:inline"
              aria-hidden="true"
            >
              · {String(index).padStart(2, '0')}
            </span>
          </div>
        </div>

        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-fg-2 text-pretty sm:text-base">
            {description}
          </p>
        ) : null}

        {bullets.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1.5">
            {bullets.slice(0, 3).map((b, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm leading-relaxed text-fg-2"
              >
                <span
                  className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {bullets.length > 3 ? (
          <details className="group mt-2">
            <summary className="cursor-pointer list-none font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent">
              <span className="inline-block group-open:hidden">+ view details</span>
              <span className="hidden group-open:inline-block">− hide details</span>
            </summary>
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
              {bullets.slice(3).map((b, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm leading-relaxed text-fg-2"
                >
                  <span
                    className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </li>
  );
}

type ExperienceTimelineProps = {
  experiences: ExperienceItemType[];
};

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  if (experiences.length === 0) {
    return <p className="font-mono text-sm text-muted">No roles yet.</p>;
  }

  return (
    <div className="relative">
      {/* Vertical timeline line — calm, low-contrast. */}
      <div
        aria-hidden="true"
        className="absolute left-[5px] top-3 bottom-3 w-px sm:left-[7px]"
        style={{ backgroundColor: 'var(--color-border)' }}
      />

      <ol className="flex flex-col gap-10 sm:gap-12">
        {experiences.map((exp, i) => (
          <ExperienceRow key={exp.id} experience={exp} index={i + 1} />
        ))}
      </ol>
    </div>
  );
}
