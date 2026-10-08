/**
 * "Core Stack" — the ten technologies I actually reach for. Hardcoded
 * (not pulled from the database) so the list is curated rather than
 * exhaustive: the database `skills` setting carries the long tail
 * for the admin panel; this list is what a recruiter needs to see in
 * three seconds.
 *
 * Renders as a quiet 2-column list, no card wall, no category
 * groupings, no echo footer.
 */
const STACK = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'NestJS',
  'PostgreSQL',
  'Docker',
  'Git',
  'Playwright',
  'Jest',
] as const;

export function CoreStack() {
  return (
    <section className="section-anchor relative py-20 sm:py-28">
      <div className="mb-12 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Stack
        </span>
        <h2 className="heading-display text-4xl sm:text-5xl">Core Stack</h2>
      </div>

      <ul
        aria-label="Core technologies"
        className="grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2 reveal-stagger"
      >
        {STACK.map((s) => (
          <li
            key={s}
            className="flex items-center gap-3 border-b border-border py-3 font-mono text-sm text-fg-2 sm:text-base"
          >
            <span aria-hidden="true" className="text-accent">·</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
