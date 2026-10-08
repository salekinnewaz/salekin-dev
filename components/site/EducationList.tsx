import type { EducationItem as EducationItemType } from '@/lib/queries/education';

type EducationListProps = {
  education: EducationItemType[];
};

export function EducationList({ education }: EducationListProps) {
  if (education.length === 0) {
    return (
      <p className="font-mono text-sm text-muted">
        <span className="text-accent-2">$</span> ls ./education/
        <span className="block pl-4 opacity-70"># no records</span>
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4 reveal-stagger">
      {education.map((ed, i) => (
        <li
          key={ed.id}
          className="glass-card glass-card-hover flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <div className="flex flex-col gap-0.5">
            <h3 className="font-mono text-base font-semibold text-fg">
              <span className="text-accent-2">
                [{String(i + 1).padStart(2, '0')}]
              </span>{' '}
              {ed.degree}
            </h3>
            <p className="text-sm text-fg-2">
              <span className="font-mono text-muted">@ </span>
              {ed.institution}
            </p>
            {ed.description ? (
              <p className="mt-1 text-sm text-muted">
                <span className="font-mono text-accent-2/80">{'> '}</span>
                {ed.description}
              </p>
            ) : null}
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted sm:text-right">
            {ed.startYear} → {ed.endYear}
          </p>
        </li>
      ))}
    </ol>
  );
}