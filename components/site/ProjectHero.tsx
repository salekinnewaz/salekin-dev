import Link from 'next/link';
import { Pill } from './Pill';

type Props = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  publishedAt: Date | null;
  repoUrl: string | null;
  liveUrl: string | null;
};

/**
 * Project case-study hero strip. Sits at the top of the detail page,
 * before the cover image. The structure mirrors an editorial brief:
 * breadcrumb · slug divider · title · description · tech stack ·
 * primary + secondary CTAs. The "view all" link and the "More
 * projects" rail (further down the page) give the visitor two clear
 * onward paths.
 */
export function ProjectHero({
  slug,
  title,
  description,
  techStack,
  publishedAt,
  repoUrl,
  liveUrl,
}: Props) {
  const publishedLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : null;

  return (
    <header className="flex flex-col gap-5 reveal">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
        <Link href="/projects" className="hover:text-accent">
          <span aria-hidden="true">← </span>ls ..
        </Link>
        {publishedLabel ? (
          <>
            <span aria-hidden="true">/</span>
            <time dateTime={new Date(publishedAt!).toISOString()}>
              {publishedLabel}
            </time>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
        <span className="text-accent-2">//</span>
        <span className="text-accent">{slug}</span>
        <span aria-hidden="true">·</span>
        <span>case study</span>
      </div>

      <h1 className="heading-display heading-gradient text-4xl sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      {description ? (
        <p className="max-w-3xl text-lg leading-relaxed text-fg-2 sm:text-xl text-pretty">
          {description}
        </p>
      ) : null}

      {techStack.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
          {techStack.map((tag) => (
            <li key={tag}>
              <Pill>{tag}</Pill>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary magnetic"
          >
            View live
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {repoUrl ? (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline magnetic"
          >
            Source
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
        ) : null}
      </div>
    </header>
  );
}
