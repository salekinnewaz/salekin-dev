'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CopyButton } from './CopyButton';
import { requestService } from '@/lib/site/service-selection';
import { nextPost, type Post } from '@/src/data/posts';

/**
 * ArticleReaderModal — the full-screen reader for an engineering note.
 *
 * Adds three things on top of the shared Modal shell:
 *   - A sticky header with the article title, category and a scroll
 *     progress bar that tracks how far through the body the reader is.
 *   - Copy buttons on every code block.
 *   - A "Key Takeaways" callout and a "Next Article →" footer that
 *     chains through the four articles in publication order.
 *
 * The consultation CTA publishes the article's service hint so the
 * contact form preselects the matching service pill.
 */
export function ArticleReaderModal({
  post,
  onClose,
  onNext,
}: {
  post: Post;
  onClose: () => void;
  onNext: (slug: string) => void;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  // Scroll progress. The reader body is the scroll container, so the
  // ratio is measured against its own scrollHeight.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    function onScroll() {
      const el = body;
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? el.scrollTop / max : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    }

    onScroll();
    body.addEventListener('scroll', onScroll, { passive: true });
    return () => body.removeEventListener('scroll', onScroll);
  }, [post.slug]);

  const upNext = nextPost(post.slug);

  return (
    <Modal
      open
      onClose={onClose}
      label={post.title}
      className="max-w-4xl"
      hideCloseButton
    >
      {/* ─── Sticky header + progress ─── */}
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg-2)] px-5 py-4 pr-14 sm:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-pill">{post.categoryLabel}</span>
          <span className="font-mono text-[0.66rem] text-[var(--color-muted)]">
            {post.dateLabel} · {post.readTime} min read
          </span>
        </div>
        <h2 className="mt-2 text-lg font-bold leading-tight tracking-tight text-[var(--color-fg)] sm:text-xl">
          {post.title}
        </h2>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-label="Article read progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* ─── Body ─── */}
      <div
        ref={bodyRef}
        className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-7"
      >
        <p className="text-[0.95rem] leading-relaxed text-[var(--color-fg-2)]">
          {post.excerpt}
        </p>

        {post.sections.map((section, i) => (
          <section key={section.heading} className="mt-6 first:mt-5">
            <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {section.heading}
            </h3>

            {section.paragraphs.map((p, j) => (
              <p
                key={`${section.heading}-p-${j}`}
                className="mt-2 text-[0.9rem] leading-relaxed text-[var(--color-fg-2)]"
              >
                {p}
              </p>
            ))}

            {section.bullets ? (
              <ul className="mt-3 flex flex-col gap-1.5">
                {section.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[0.88rem] leading-relaxed text-[var(--color-fg-2)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            {section.code ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2">
                  <span className="truncate font-mono text-[0.62rem] text-[var(--color-muted)]">
                    {section.code.filename ?? section.code.language}
                  </span>
                  <CopyButton
                    value={section.code.code}
                    variant="compact"
                    toastMessage="Code copied"
                  >
                    Copy
                  </CopyButton>
                </div>
                <pre className="overflow-x-auto px-3 py-3">
                  <code className="font-mono text-[0.72rem] leading-relaxed text-[var(--color-fg-2)]">
                    {section.code.code}
                  </code>
                </pre>
              </div>
            ) : null}

            {i === post.sections.length - 1 ? null : null}
          </section>
        ))}

        {/* ─── Key Takeaways ─── */}
        <div className="mt-6 rounded-xl border border-[var(--color-accent)]/35 bg-[var(--color-accent-soft)] p-4">
          <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Key Takeaways
          </h3>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {post.takeaways.map((t) => (
              <li
                key={t}
                className="flex items-start gap-2 text-[0.85rem] leading-relaxed text-[var(--color-fg-2)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[0.58rem] text-[var(--color-accent)]"
                >
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-2)] px-5 py-4 sm:px-7">
        <button
          type="button"
          onClick={() => onNext(upNext.slug)}
          className="inline-flex min-w-0 items-center gap-2 text-left"
        >
          <span className="flex flex-col">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Next article
            </span>
            <span className="max-w-[16rem] truncate text-[0.85rem] font-semibold text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]">
              {upNext.title}
            </span>
          </span>
          <span aria-hidden="true" className="text-[var(--color-accent)]">
            →
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            requestService(post.serviceHint);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-[0.85rem] font-semibold text-white transition-[filter] hover:brightness-110"
        >
          Book a Consultation <span aria-hidden="true">→</span>
        </button>
      </div>
    </Modal>
  );
}
