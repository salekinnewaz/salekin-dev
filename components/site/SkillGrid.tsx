import type { SkillsByCategory } from '@/lib/queries/site';

type SkillGridProps = {
  skills: SkillsByCategory;
};

const CATEGORY_META: Record<keyof SkillsByCategory, { label: string; count: string }> = {
  languages: { label: 'Languages', count: '01' },
  frameworks: { label: 'Frameworks', count: '02' },
  databases: { label: 'Databases', count: '03' },
  tools: { label: 'Tools', count: '04' },
  soft: { label: 'Soft skills', count: '05' },
};

const CATEGORY_ORDER: (keyof SkillsByCategory)[] = [
  'languages',
  'frameworks',
  'databases',
  'tools',
  'soft',
];

export function SkillGrid({ skills }: SkillGridProps) {
  // Build the flat list of "all" skills for the marquee ticker.
  const flat = CATEGORY_ORDER.flatMap((k) => skills[k]);
  const marquee = flat.length > 0 ? [...flat, ...flat] : [];

  return (
    <div className="flex flex-col gap-12">
      {marquee.length > 0 ? (
        <div className="-mx-5 overflow-hidden sm:-mx-10 reveal">
          <div className="marquee gap-3 py-2">
            {marquee.map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="tag shrink-0 whitespace-nowrap"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 reveal-stagger">
        {CATEGORY_ORDER.map((key) => {
          const items = skills[key];
          const meta = CATEGORY_META[key];
          if (items.length === 0) return null;
          return (
            <div
              key={key}
              className="glass-card glass-card-hover flex flex-col gap-4 p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
                  {meta.label}
                </h3>
                <span className="font-mono text-xs text-accent">
                  {meta.count}
                </span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <li key={item}>
                    <span className="tag">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}