'use client';

import { useMemo, useState } from 'react';
import { SectionHeader } from './SectionHeader';
import { SpotlightCard } from './SpotlightCard';
import {
  POSTS,
  POST_CATEGORIES,
  type Post,
  type PostCategoryId,
} from '@/src/data/posts';
import { ArticleReaderModal } from './ArticleReaderModal';

/**
 * BlogSection — module 03.
 *
 * A live-searching, category-filterable 2x2 grid of engineering notes.
 * The search box filters on title, excerpt and category label as the user
 * types; the category tabs narrow further. When both filters exclude
 * everything, an empty state offers a one-click reset.
 */
export function BlogSection() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PostCategoryId>('all');
  const [openPost, setOpenPost] = useState<Post | null>(null);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((post) => {
      if (category !== 'all' && post.category !== category) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  function reset() {
    setQuery('');
    setCategory('all');
  }

  return (
    <section
      id="blog"
      tabIndex={-1}
      className="section-anchor relative py-14 lg:py-16"
    >
        <SectionHeader
          index="03"
          name="Engineering Notes"
          title="Written from the work, not the theory"
          description="Four technical articles on Playwright architecture, AI-assisted QA, CI/CD reporting and release readiness."
          actions={
            <label
              htmlFor="blog-search"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
                className="shrink-0 text-[var(--color-muted)]"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                aria-label="Search articles"
                className="h-9 w-full min-w-0 bg-transparent text-[0.85rem] text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)] sm:w-44"
              />
            </label>
          }
        />

        {/* ─── Category filters ─── */}
        <div
          role="group"
          aria-label="Filter articles"
          className="mt-5 flex flex-wrap items-center gap-1.5"
        >
          {POST_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              data-active={category === c.id || undefined}
              className="filter-pill"
            >
              {c.label}
            </button>
          ))}
          <span className="ml-1 font-mono text-[0.68rem] text-[var(--color-muted)]">
            {visiblePosts.length} of {POSTS.length}
          </span>
        </div>

        {/* ─── Article grid ─── */}
        {visiblePosts.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {visiblePosts.map((post) => (
              <SpotlightCard
                key={post.slug}
                as="article"
                className="flex h-full flex-col p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono-pill w-fit">{post.categoryLabel}</span>
                  <span className="font-mono text-[0.66rem] text-[var(--color-muted)]">
                    {post.dateLabel} · {post.readTime} min read
                  </span>
                </div>

                <h3 className="mt-3 text-[1.05rem] font-bold leading-snug tracking-tight text-[var(--color-fg)]">
                  {post.title}
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--color-fg-2)]">
                  {post.excerpt}
                </p>

                <div className="bento-footer mt-4 flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.66rem] text-[var(--color-muted)]">
                    {post.sections.length} sections
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenPost(post)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                  >
                    Read Article <span aria-hidden="true">→</span>
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border-strong)] px-6 py-10 text-center">
            <p className="text-[0.9rem] text-[var(--color-fg-2)]">
              No notes match that search.
            </p>
            <p className="mt-1 text-[0.8rem] text-[var(--color-muted)]">
              Try a different term, or clear the filters.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-lg border border-[var(--color-border)] px-3.5 py-1.5 text-[0.8rem] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Clear filters
            </button>
          </div>
        )}

        {openPost ? (
          <ArticleReaderModal
            post={openPost}
            onClose={() => setOpenPost(null)}
            onNext={(slug) => {
              const next = POSTS.find((p) => p.slug === slug);
              if (next) setOpenPost(next);
            }}
          />
        ) : null}
    </section>
  );
}
