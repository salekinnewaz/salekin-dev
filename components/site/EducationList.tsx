import type { EducationItem as EducationItemType } from '@/lib/queries/education';

type EducationListProps = {
  education: EducationItemType[];
};

export function EducationList({ education }: EducationListProps) {
  if (education.length === 0) {
    return (
      <p className="text-sm text-muted">No education entries yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-4 reveal-stagger">
      {education.map((ed) => (
        <li
          key={ed.id}
          className="glass-card glass-card-hover flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <div className="flex flex-col gap-0.5">
            <h3 className="font-mono text-base font-semibold text-fg">
              {ed.degree}
            </h3>
            <p className="text-sm text-fg-2">{ed.institution}</p>
            {ed.description ? (
              <p className="mt-1 text-sm text-muted">{ed.description}</p>
            ) : null}
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted sm:text-right">
            {ed.startYear} — {ed.endYear}
          </p>
        </li>
      ))}
    </ol>
  );
}