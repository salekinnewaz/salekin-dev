import type { ExperienceItem } from '@/lib/queries/experiences';
import { SectionDivider } from './SectionDivider';
import { NowWidget } from './NowWidget';

type Props = {
  experiences: ExperienceItem[];
};

const DEFAULT_NOW = {
  building:
    'Internal tooling at Braintree — shipping fast, scrappy, and small.',
  learning: 'Distributed systems and Postgres internals.',
  reading: '"Designing Data-Intensive Applications" — again.',
};

/**
 * "Currently" section — three glass cards (building / learning /
 * reading) with a live UTC+6 clock on the first card, plus a small
 * "current role" panel when the experience table has an open row.
 *
 * This is the heart of the "always-on" portfolio: while you sit on
 * the page, the clock visibly ticks and the rest of the cards make
 * it obvious what I'm shipping right now.
 */
export function CurrentlyBuildingSection({ experiences }: Props) {
  const current = experiences.find((e) => e.endDate === null) ?? null;

  return (
    <section
      id="now"
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="flex flex-col gap-4 reveal">
        <SectionDivider name="now" trailing="// live" />
        <h2 className="heading-display text-4xl sm:text-5xl">
          <span className="font-mono text-accent-2">$</span>{' '}
          <span className="text-fg">now</span>{' '}
          <span className="text-muted">--building</span>
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-5">
        {current ? (
          <CurrentRoleCard
            role={current.role}
            company={current.company}
            description={current.description}
          />
        ) : (
          <BuildingCardFallback />
        )}

        <NowWidget
          building={DEFAULT_NOW.building}
          learning={DEFAULT_NOW.learning}
          reading={DEFAULT_NOW.reading}
        />
      </div>
    </section>
  );
}

function CurrentRoleCard({
  role,
  company,
  description,
}: {
  role: string;
  company: string;
  description: string | null;
}) {
  return (
    <article className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 lg:col-span-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent-2">
          $ now_role
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
          <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          in progress
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="heading-display text-2xl text-fg sm:text-3xl">
          {role}
        </h3>
        <p className="font-mono text-sm text-accent-2">@ {company}</p>
      </div>
      {description ? (
        <p className="text-sm leading-relaxed text-fg-2 text-pretty">
          <span className="font-mono text-accent-2/80">{'> '}</span>
          {description}
        </p>
      ) : null}
    </article>
  );
}

function BuildingCardFallback() {
  return (
    <article className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 lg:col-span-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-accent-2">
        $ now_building
      </span>
      <p className="text-sm leading-relaxed text-fg-2 text-pretty">
        <span className="font-mono text-accent-2/80">{'> '}</span>
        {DEFAULT_NOW.building}
      </p>
    </article>
  );
}
