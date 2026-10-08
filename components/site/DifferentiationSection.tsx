import { SectionDivider } from './SectionDivider';

type Mindset = {
  key: 'eng' | 'prod' | 'qual' | 'learn';
  title: string;
  blurb: string;
};

const MINDSETS: Mindset[] = [
  {
    key: 'eng',
    title: 'Engineering mindset',
    blurb:
      'Types and contracts at the boundary, testable units, and clean seams between layers. I optimize for the next reader of the code, not just the next deploy.',
  },
  {
    key: 'prod',
    title: 'Product mindset',
    blurb:
      'I think about the user outcome before the implementation. Features ship with a metric, an empty state, and a failure mode — not just a happy path.',
  },
  {
    key: 'qual',
    title: 'Quality mindset',
    blurb:
      'Tests, accessibility, performance, and observability are part of "done" — not a follow-up ticket. Lighthouse-clean on every shipped page.',
  },
  {
    key: 'learn',
    title: 'Continuous learning',
    blurb:
      'Currently reading "Designing Data-Intensive Applications" and learning distributed-systems patterns. The portfolio gets a refresh whenever I do.',
  },
];

/**
 * 4 differentiators — what working with me feels like, framed as
 * honest engineering traits rather than generic soft skills.
 */
export function DifferentiationSection() {
  return (
    <section
      id="why"
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="flex flex-col gap-4 reveal">
        <SectionDivider name="why" trailing="// what I optimize for" />
        <h2 className="heading-display text-4xl sm:text-5xl">
          <span className="font-mono text-accent-2">$</span>{' '}
          <span className="text-fg">cat</span>{' '}
          <span className="heading-gradient">./principles</span>
        </h2>
      </div>

      <ol
        aria-label="Working principles"
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 reveal-stagger"
      >
        {MINDSETS.map((m, i) => (
          <li
            key={m.key}
            className="differentiation-card flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent-2">
              mindset:{m.key}
            </span>
            <h3 className="heading-display text-lg text-fg sm:text-xl">
              {String(i + 1).padStart(2, '0')} · {m.title}
            </h3>
            <p className="text-sm leading-relaxed text-fg-2 text-pretty">
              {m.blurb}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
