import type { ExperienceItem } from '@/lib/queries/experiences';

type Props = {
  /** All experiences; the component picks the current (endDate === null) one. */
  experiences: ExperienceItem[];
};

const FOCUS = [
  'QA strategy',
  'Playwright automation',
  'AI-driven QA',
  'CI/CD integration',
  'API testing',
  'Performance testing',
  'UAT & release management',
  'Mentoring',
  'Presales',
] as const;

const ACHIEVEMENTS: { label: string; detail: string }[] = [
  {
    label: '4+ concurrent international projects',
    detail:
      'QA lead across logistics, oil & gas, IoT, e-commerce, and rideshare engagements running in parallel.',
  },
  {
    label: 'Up to 60% reduction in regression cycles',
    detail:
      'Helped reduce regression cycle time through Playwright automation and CI/CD integration.',
  },
  {
    label: '3 production releases · Norway client',
    detail:
      'UAT coordination, client sign-off, and release readiness for a Norway-based client.',
  },
  {
    label: 'International exposure',
    detail: 'Norway · Canada · USA',
  },
  {
    label: 'Mentored junior QA engineers',
    detail:
      'Code reviews, test architecture guidance, and Playwright automation training.',
  },
];

/**
 * Current role — promoted to its own prominent section.
 *
 * Surfaces the most important fact a recruiter needs in 5 seconds:
 * "what is this person doing right now and what kind of impact do
 * they have?" (Brief §3, §6.)
 */
export function CurrentRole({ experiences }: Props) {
  const current = experiences.find((e) => e.endDate === null) ?? null;

  // Fallback — if the DB hasn't been seeded yet, render an empty
  // section so the page doesn't break.
  if (!current) {
    return null;
  }

  const startLabel = current.startDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <section
      id="current"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="mb-10 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Current role
        </span>
        <h2 className="heading-display text-4xl sm:text-5xl">
          What I&apos;m doing now
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-3 reveal">
          <h3 className="heading-display text-2xl text-fg sm:text-3xl">
            {current.role}
          </h3>
          <p className="text-fg-2">{current.company} · Dhaka, Bangladesh</p>
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span>
              <span className="text-fg-2">in progress</span> · {startLabel} —
              Present
            </span>
          </p>

          <ul
            aria-label="Focus areas"
            className="mt-4 flex flex-wrap gap-2"
          >
            {FOCUS.map((f) => (
              <li key={f}>
                <span className="tag">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <ol
          aria-label="Key achievements"
          className="flex flex-col gap-5 reveal-stagger"
        >
          {ACHIEVEMENTS.map((a) => (
            <li
              key={a.label}
              className="border-t border-border pt-4 first:border-t-0 first:pt-0"
            >
              <p className="text-base font-medium text-fg sm:text-lg">
                {a.label}
              </p>
              <p className="mt-1 text-sm text-fg-2 text-pretty">
                {a.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
