import type { SkillsByCategory } from '@/lib/queries/site';

type SkillGridProps = {
  skills: SkillsByCategory;
};

/**
 * Skill taxonomy: rename the raw categories to recruiter-friendly
 * group names, and add a one-line description per group. We are
 * honest about what each category is — no fake percentages.
 */
const CATEGORY_META: Record<
  keyof SkillsByCategory,
  { label: string; blurb: string; count: string }
> = {
  languages: {
    label: 'Languages',
    blurb: 'What I think in.',
    count: '01',
  },
  frameworks: {
    label: 'Frameworks',
    blurb: 'What I build with.',
    count: '02',
  },
  databases: {
    label: 'Databases',
    blurb: 'Where the data lives.',
    count: '03',
  },
  tools: {
    label: 'Tooling',
    blurb: 'How I ship it.',
    count: '04',
  },
  soft: {
    label: 'Practice',
    blurb: 'Habits beyond code.',
    count: '05',
  },
};

const CATEGORY_ORDER: (keyof SkillsByCategory)[] = [
  'languages',
  'frameworks',
  'databases',
  'tools',
  'soft',
];

export function SkillGrid({ skills }: SkillGridProps) {
  // Build a deduplicated, comma-joined list of all skills for the
  // quiet footer note that replaced the old marquee.
  const flat = Array.from(
    new Set(CATEGORY_ORDER.flatMap((k) => skills[k])),
  );

  return (
    <div className="flex flex-col gap-10">
      <div
        role="list"
        aria-label="Skills by category"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 reveal-stagger"
      >
        {CATEGORY_ORDER.map((key) => {
          const items = skills[key];
          const meta = CATEGORY_META[key];
          if (items.length === 0) return null;
          return (
            <div
              key={key}
              role="listitem"
              className="glass-card glass-card-hover flex flex-col gap-4 p-6"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-mono text-base font-semibold text-fg">
                    <span className="text-accent-2">{meta.count}</span>{' '}
                    {meta.label}
                  </h3>
                  <p className="text-xs text-muted">{meta.blurb}</p>
                </div>
                <span className="font-mono text-xs text-muted">
                  {String(items.length).padStart(2, '0')}
                </span>
              </div>
              <ul className="flex flex-wrap gap-2" role="list">
                {items.map((item) => (
                  <li key={item} role="listitem">
                    <span className="tag">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {flat.length > 0 ? (
        <p className="font-mono text-xs text-muted reveal">
          <span className="text-accent-2">$</span> echo{' '}
          <span className="text-fg-2">
            {flat.map((s) => s.toLowerCase()).join(' · ')}
          </span>
          <span className="text-muted"> # also handy</span>
        </p>
      ) : null}
    </div>
  );
}
