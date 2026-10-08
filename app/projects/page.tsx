import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublishedProjects } from '@/lib/queries/projects';
import { getSiteSettings } from '@/lib/queries/site';
import { ProjectCard } from '@/components/site/ProjectCard';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Case studies of full-stack apps, internal tools, and freelance work I have built and shipped.',
};

/**
 * Projects index — the case-studies landing page.
 *
 * The header reads as a small editorial brief: who built this, what
 * kind of work is here, and a count. The grid is the same responsive
 * 1/2/3-col layout. Below the grid we surface a quick "filter by
 * stack" chip row derived from the actual project data — no fake
 * categories, just a useful "jump to" affordance.
 */
export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([
    listPublishedProjects(),
    getSiteSettings(),
  ]);
  const count = projects.length;

  // Distinct tech tags, sorted by frequency then alphabetical. Used
  // for the filter chip row; never invented.
  const tagCounts = new Map<string, number>();
  for (const p of projects) {
    for (const tag of p.techStack) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([t]) => t);

  const github = site.identity.socialGithub;

  return (
    <div className="flex flex-col gap-12 pt-12 pb-20 sm:pt-16">
      <header className="flex flex-col gap-5 reveal">
        <div className="flex items-center gap-3">
          <span className="eyebrow">Case studies</span>
          <span className="eyebrow__index">{count.toString().padStart(2, '0')}</span>
        </div>
        <h1 className="heading-display heading-gradient text-5xl sm:text-6xl lg:text-7xl">
          <span className="block font-mono text-accent-2">$</span>{' '}
          <span className="block">ls</span>{' '}
          <span className="block">./projects</span>{' '}
          <span className="block text-muted">--published</span>
        </h1>
        <p className="max-w-2xl text-base text-fg-2 sm:text-lg text-pretty">
          A small archive of full-stack apps, internal tools, and
          freelance work. Each one is a real project — pick one to see
          the long-form write-up, repo, and live link.
        </p>
      </header>

      {topTags.length > 0 ? (
        <div
          aria-label="Filter by stack"
          className="flex flex-wrap items-center gap-2 reveal"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            stack ·
          </span>
          {topTags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {count === 0 ? (
        <EmptyState github={github} />
      ) : (
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 reveal-stagger"
          data-testid="projects-grid"
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i + 1} />
          ))}
        </div>
      )}

      <nav
        aria-label="Back to home"
        className="mt-4 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted"
      >
        <Link href="/" className="hover:text-accent">
          <span aria-hidden="true">← </span>cd ..
        </Link>
        <span aria-hidden="true">/</span>
        <span>case studies</span>
      </nav>
    </div>
  );
}

function EmptyState({ github }: { github: string | null }) {
  return (
    <div className="glass-card flex flex-col items-start gap-4 p-8">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        <span className="text-accent-2">$</span> ls ./projects
      </span>
      <p className="max-w-prose text-base text-fg-2 text-pretty">
        No published case studies on this site yet. In the meantime,
        the code lives on GitHub.
      </p>
      {github ? (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline magnetic"
        >
          <span aria-hidden="true" className="font-mono text-fg-2/80">$</span>
          open github profile
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <p className="text-sm text-muted">
          Case studies will land here as soon as they&apos;re published
          from the admin panel.
        </p>
      )}
    </div>
  );
}
