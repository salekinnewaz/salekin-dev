/**
 * Sticky table of contents for a project body. Parses `## h2` headings
 * out of the markdown source on the server and renders them as anchor
 * links. Hidden on mobile (no room), shown on lg+ as a quiet side
 * rail. The active link is updated client-side by `ProjectTocClient`.
 */
import { ProjectTocClient } from './ProjectTocClient';
import { slugifyHeading } from './ProjectMarkdown';

type TocItem = { id: string; text: string };

function extractToc(markdown: string | null): TocItem[] {
  if (!markdown) return [];
  const out: TocItem[] = [];
  const lines = markdown.split('\n');
  let inFence = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (!m || !m[1]) continue;
    const text = m[1].trim();
    out.push({ id: slugifyHeading(text), text });
  }
  return out;
}

type Props = {
  markdown: string | null;
};

export function ProjectToc({ markdown }: Props) {
  const items = extractToc(markdown);
  if (items.length < 2) return null;

  return (
    <aside
      aria-label="Table of contents"
      className="sticky top-28 hidden self-start lg:block"
    >
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          <span className="text-accent-2">$</span> toc
        </span>
        <ProjectTocClient items={items} />
      </div>
    </aside>
  );
}
