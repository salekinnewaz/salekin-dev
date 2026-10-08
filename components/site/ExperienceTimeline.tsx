'use client';

import { useRef, type MouseEvent } from 'react';
import type { ExperienceItem as ExperienceItemType } from '@/lib/queries/experiences';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

type ExperienceCardProps = {
  experience: ExperienceItemType;
  isLast: boolean;
};

function ExperienceCard({ experience, isLast }: ExperienceCardProps) {
  const { company, role, startDate, endDate, description, bullets } = experience;
  const end = endDate ? formatMonthYear(endDate) : 'Present';
  const isCurrent = endDate === null;

  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="glow-card relative p-6 sm:p-7 reveal"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="heading-display text-xl text-fg sm:text-2xl">
            {role}
          </h3>
          <p className="font-mono text-sm text-accent-2">
            @ {company}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span
            className={
              isCurrent
                ? 'inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-accent'
                : 'font-mono text-xs uppercase tracking-wider text-muted'
            }
          >
            {isCurrent ? (
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            ) : null}
            {isCurrent ? 'Current' : 'Past'}
          </span>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            {formatMonthYear(startDate)} — {end}
          </p>
        </div>
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-fg-2">
          {description}
        </p>
      ) : null}

      {bullets.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm leading-relaxed text-fg-2"
            >
              <span
                className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type ExperienceTimelineProps = {
  experiences: ExperienceItemType[];
};

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  if (experiences.length === 0) {
    return (
      <p className="text-sm text-muted">No experience entries yet.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line with gradient */}
      <div
        aria-hidden="true"
        className="absolute left-[19px] top-2 bottom-2 w-px sm:left-6"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-accent) 12%, var(--color-accent-2) 50%, var(--color-accent) 88%, transparent)',
          opacity: 0.4,
        }}
      />

      <ol className="flex flex-col gap-6 sm:gap-8">
        {experiences.map((exp, i) => (
          <li key={exp.id} className="relative pl-12 sm:pl-16">
            {/* Timeline dot */}
            <span
              className="timeline-dot absolute left-[12px] top-7 sm:left-[19px]"
              aria-hidden="true"
            />
            <ExperienceCard
              experience={exp}
              isLast={i === experiences.length - 1}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}