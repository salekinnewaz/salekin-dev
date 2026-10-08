import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublishedProjects } from '@/lib/queries/projects';
import { ProjectCard } from '@/components/site/ProjectCard';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A small archive of things I have built — full-stack apps, internal tools, and freelance client work.',
};

/**
 * Projects index.
 *
 * Pulls published projects from the DB and renders them as a responsive
 * grid of <ProjectCard> tiles. Each card already does its own hover lift
 * + gradient cover, so the page-level chrome stays quiet: just an
 * eyebrow, a display heading, a count, and the grid.
 *
 * The empty state is intentional — a fresh install (no seed projects)
 * should still feel like a real page rather than a broken route.
 */
export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  const count = projects.length;

  return (
    <div className="flex flex-col gap-10 pt-12 pb-20 sm:pt-16">
      <header className="flex flex-col gap-4 reveal">
        <div className="flex items-center gap-3">
          <span className="eyebrow">Projects</span>
          <span className="eyebrow__index">{count.toString().padStart(2, '0')}</span>
        </div>
        <h1 className="heading-display heading-gradient text-5xl sm:text-6xl lg:text-7xl">
          <span className="block">Things I&apos;ve</span>
          <span className="block">shipped.</span>
        </h1>
        <p className="max-w-2xl text-base text-fg-2 sm:text-lg text-pretty">
          A small archive of full-stack apps, internal tools, and freelance
          work. Each one is a real project — pick one to see the long-form
          write-up, repo, and live link.
        </p>
      </header>

      {count === 0 ? (
        <EmptyState />
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
        className="mt-8 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted"
      >
        <Link href="/" className="hover:text-accent">
          ← back home
        </Link>
        <span aria-hidden="true">/</span>
        <span>case studies</span>
      </nav>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card flex flex-col items-start gap-3 p-8">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        no entries
      </span>
      <p className="max-w-prose text-base text-fg-2 text-pretty">
        No published projects yet. New case studies are added through the
        admin panel — they will show up here as soon as they are published.
      </p>
    </div>
  );
}
