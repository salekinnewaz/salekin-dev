import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Block =
  | { kind: 'p'; children: Inline[] }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'ul'; items: Inline[][] }
  | { kind: 'ol'; items: Inline[][] }
  | { kind: 'code'; text: string };

type Inline =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; children: Inline[] }
  | { kind: 'italic'; children: Inline[] }
  | { kind: 'code'; value: string }
  | { kind: 'link'; href: string; children: Inline[] };

/**
 * Tiny markdown-ish renderer for project bodies.
 *
 * This is intentionally NOT a full markdown parser — we only support the
 * subset the seed/admin actually emits:
 *   - paragraphs (blank-line separated)
 *   - `## h2`, `### h3`
 *   - `- item` and `1. item` lists
 *   - fenced ```code``` blocks
 *   - inline `**bold**`, `*italic*`, `` `code` ``, and `[text](url)` links
 *
 * Everything is rendered as React elements (never `dangerouslySetInnerHTML`),
 * so the input is treated as plain text and can't inject HTML.
 *
 * URL safety: only http(s) and mailto schemes are emitted. Anything else
 * is rendered as plain text to avoid javascript: payloads.
 */
export function ProjectMarkdown({ source }: { source: string | null }) {
  if (!source || !source.trim()) {
    return (
      <p className="text-sm italic text-muted">
        No write-up yet. Check the source link below for details.
      </p>
    );
  }
  const blocks = parse(source);
  return (
    <div className="flex flex-col gap-5 text-base leading-relaxed text-fg-2">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="text-pretty">
          {block.children.map((c, i) => (
            <InlineView key={i} node={c} />
          ))}
        </p>
      );
    case 'h2':
      return (
        <h2 className="heading-display mt-4 text-2xl text-fg sm:text-3xl">
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 className="mt-2 font-mono text-sm uppercase tracking-widest text-accent">
          {block.text}
        </h3>
      );
    case 'ul':
      return (
        <ul className="ml-5 list-disc space-y-1.5 marker:text-accent">
          {block.items.map((item, i) => (
            <li key={i}>
              {item.map((c, j) => (
                <InlineView key={j} node={c} />
              ))}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="ml-5 list-decimal space-y-1.5 marker:text-accent">
          {block.items.map((item, i) => (
            <li key={i}>
              {item.map((c, j) => (
                <InlineView key={j} node={c} />
              ))}
            </li>
          ))}
        </ol>
      );
    case 'code':
      return (
        <pre className="terminal-card overflow-x-auto p-4 text-[13px]">
          <code className="font-mono text-fg-2">{block.text}</code>
        </pre>
      );
  }
}

function InlineView({ node }: { node: Inline }): ReactNode {
  switch (node.kind) {
    case 'text':
      return <>{node.value}</>;
    case 'bold':
      return (
        <strong className="font-semibold text-fg">
          {node.children.map((c, i) => (
            <InlineView key={i} node={c} />
          ))}
        </strong>
      );
    case 'italic':
      return (
        <em>
          {node.children.map((c, i) => (
            <InlineView key={i} node={c} />
          ))}
        </em>
      );
    case 'code':
      return (
        <code className="rounded bg-muted/20 px-1.5 py-0.5 font-mono text-[0.9em] text-accent">
          {node.value}
        </code>
      );
    case 'link': {
      const safe = safeHref(node.href);
      if (!safe) return <>{node.children.map((c, i) => <InlineView key={i} node={c} />)}</>;
      const external = /^https?:\/\//i.test(safe);
      return (
        <a
          href={safe}
          className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent"
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {node.children.map((c, i) => (
            <InlineView key={i} node={c} />
          ))}
        </a>
      );
    }
  }
}

function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) return trimmed;
  return null;
}

// ── Parser ─────────────────────────────────────────────────────────────

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    // Fenced code block
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i] ?? '')) {
        buf.push(lines[i] ?? '');
        i++;
      }
      i++; // skip closing fence
      blocks.push({ kind: 'code', text: buf.join('\n') });
      continue;
    }
    // Blank line — skip
    if (!line.trim()) {
      i++;
      continue;
    }
    // Heading
    if (/^###\s+/.test(line)) {
      blocks.push({ kind: 'h3', text: line.replace(/^###\s+/, '').trim() });
      i++;
      continue;
    }
    if (/^##\s+/.test(line)) {
      blocks.push({ kind: 'h2', text: line.replace(/^##\s+/, '').trim() });
      i++;
      continue;
    }
    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? '')) {
        items.push(parseInline((lines[i] ?? '').replace(/^[-*]\s+/, '')));
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? '')) {
        items.push(parseInline((lines[i] ?? '').replace(/^\d+\.\s+/, '')));
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }
    // Paragraph — consume until blank line / heading / list / fence
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() &&
      !/^(```|###\s|##\s|[-*]\s|\d+\.\s)/.test(lines[i] ?? '')
    ) {
      buf.push(lines[i] ?? '');
      i++;
    }
    blocks.push({ kind: 'p', children: parseInline(buf.join(' ')) });
  }
  return blocks;
}

function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push({ kind: 'text', value: buf });
      buf = '';
    }
  };
  while (i < text.length) {
    const ch = text[i];
    // Inline code
    if (ch === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i) {
        flush();
        out.push({ kind: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    // Bold ** **
    if (ch === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end > i + 1) {
        flush();
        out.push({
          kind: 'bold',
          children: parseInline(text.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }
    // Italic * *
    if (ch === '*') {
      const end = text.indexOf('*', i + 1);
      if (end > i) {
        flush();
        out.push({
          kind: 'italic',
          children: parseInline(text.slice(i + 1, end)),
        });
        i = end + 1;
        continue;
      }
    }
    // Link [text](url)
    if (ch === '[') {
      const close = text.indexOf(']', i + 1);
      if (close > i && text[close + 1] === '(') {
        const urlEnd = text.indexOf(')', close + 2);
        if (urlEnd > close) {
          flush();
          const label = text.slice(i + 1, close);
          const href = text.slice(close + 2, urlEnd);
          out.push({
            kind: 'link',
            href,
            children: parseInline(label),
          });
          i = urlEnd + 1;
          continue;
        }
      }
    }
    buf += ch ?? '';
    i++;
  }
  flush();
  return out;
}

// Re-export cn so consumer doesn't have to import separately
export const _cn = cn;
