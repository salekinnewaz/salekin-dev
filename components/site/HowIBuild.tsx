type Card = {
  index: string;
  title: string;
  blurb: string;
};

/**
 * "How I Build" — exactly three cards. Per brief §11:
 *   - STRATEGY  (risk-based test planning, requirement analysis, release readiness)
 *   - AUTOMATION (scalable Playwright frameworks, API testing, CI/CD)
 *   - QUALITY  (performance, reliability, UAT, continuous improvement)
 *
 * Calm, no glow, no hover gradient, no terminal prefix on the heading.
 * Recruiter reads in 3 s.
 */
const CARDS: Card[] = [
  {
    index: '01',
    title: 'Strategy',
    blurb:
      'Risk-based test planning, requirement analysis and release readiness — every decision grounded in what actually risks the user.',
  },
  {
    index: '02',
    title: 'Automation',
    blurb:
      'Scalable Playwright frameworks, API and contract testing, CI/CD integration — automation that pays back over months, not weeks.',
  },
  {
    index: '03',
    title: 'Quality',
    blurb:
      'Performance, reliability, UAT and continuous quality improvement — observability and feedback loops, not just pass/fail.',
  },
];

export function HowIBuild() {
  return (
    <section className="section-anchor relative py-20 sm:py-28">
      <div className="mb-12 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Approach
        </span>
        <h2 className="heading-display heading-underline text-4xl sm:text-5xl">How I Build</h2>
      </div>

      <ol
        aria-label="How I build"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3 reveal-stagger"
      >
        {CARDS.map((c) => (
          <li
            key={c.index}
            className="flex flex-col gap-3 bg-card p-6 sm:p-8"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent-2">
              {c.index}
            </span>
            <h3 className="heading-display text-2xl text-fg sm:text-3xl">
              {c.title}
            </h3>
            <p className="text-sm leading-relaxed text-fg-2 text-pretty sm:text-base">
              {c.blurb}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
