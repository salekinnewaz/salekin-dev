import type { ReactNode } from 'react';

/**
 * SectionHeader — the baseline-aligned header that opens every module.
 *
 * Layout (Section 02 of the refactor spec): a single flex row. The
 * left side carries a monospace index ("01 // SERVICES") above the
 * display heading. The right side holds contextual controls — filter
 * pills, a search field, an SLA badge, a LinkedIn link — and is
 * baseline-aligned with the heading so both rows share a common
 * baseline rather than floating independently.
 */

export type SectionHeaderProps = {
  /** The numeric index, e.g. "01". */
  index: string;
  /** The module name, e.g. "SERVICES". */
  name: string;
  /** The display heading. */
  title: string;
  /** Optional one-line description under the heading. */
  description?: string;
  /** Right-hand controls slot — filter pills, search, badges, links. */
  actions?: ReactNode;
  /** Heading level for correct document outline. */
  as?: 'h2' | 'h3';
};

export function SectionHeader({
  index,
  name,
  title,
  description,
  actions,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <span className="section-index block">
          {index} <span className="text-[var(--color-muted)]">//</span> {name}
        </span>
        <Heading className="mt-2 text-3xl font-bold leading-[1.1] tracking-tight text-[var(--color-fg)] sm:text-4xl">
          {title}
        </Heading>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
