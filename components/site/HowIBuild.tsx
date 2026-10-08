type Card = {
  index: string;
  title: string;
  blurb: string;
};

/**
 * "How I Build" — exactly three cards. Replaces the previous
 * ApproachSection (6 cards) and DifferentiationSection (4 cards) so
 * the page has one engineering-principles block instead of two.
 *
 * Cards are calm and minimal — no glow, no hover gradient, no
 * terminal prefix on the heading. Just an index, a title, a
 * sentence. Recruiter reads in 3 s.
 */
const CARDS: Card[] = [
  {
    index: '01',
    title: 'Build',
    blurb:
      'Simple architecture, strong types at the boundary, and small composable pieces. I optimise for the next reader, not the next deploy.',
  },
  {
    index: '02',
    title: 'Quality',
    blurb:
      'Tests, accessibility, and performance are part of "done" — not a follow-up ticket. CI runs on every push.',
  },
  {
    index: '03',
    title: 'Ship',
    blurb:
      'Atomic commits, preview deploys, no skipped hooks. I ship in small, reversible slices and watch what real users do.',
  },
];

export function HowIBuild() {
  return (
    <section className="section-anchor relative py-20 sm:py-28">
      <div className="mb-12 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Principles
        </span>
        <h2 className="heading-display text-4xl sm:text-5xl">How I Build</h2>
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
