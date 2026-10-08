// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectMarkdown } from './ProjectMarkdown';

describe('ProjectMarkdown', () => {
  it('renders null as a placeholder', () => {
    render(<ProjectMarkdown source={null} />);
    expect(screen.getByText(/no write-up yet/i)).toBeInTheDocument();
  });

  it('renders an empty string as a placeholder', () => {
    render(<ProjectMarkdown source="   " />);
    expect(screen.getByText(/no write-up yet/i)).toBeInTheDocument();
  });

  it('renders paragraphs and inline bold/italic/code', () => {
    render(
      <ProjectMarkdown
        source={'A paragraph with **bold**, *italic*, and `inline`.'}
      />,
    );
    const p = screen.getByText(/^A paragraph with/);
    expect(p.tagName).toBe('P');
    expect(p.querySelector('strong')?.textContent).toBe('bold');
    expect(p.querySelector('em')?.textContent).toBe('italic');
    expect(p.querySelector('code')?.textContent).toBe('inline');
  });

  it('renders headings', () => {
    const { container } = render(
      <ProjectMarkdown source={'## Sub\n### Tiny\nbody'} />,
    );
    expect(container.querySelector('h2')?.textContent).toBe('Sub');
    expect(container.querySelector('h3')?.textContent).toBe('Tiny');
  });

  it('renders unordered and ordered lists', () => {
    const { container } = render(
      <ProjectMarkdown
        source={'- one\n- two\n\n1. first\n2. second'}
      />,
    );
    const uls = container.querySelectorAll('ul');
    const ols = container.querySelectorAll('ol');
    expect(uls.length).toBe(1);
    expect(ols.length).toBe(1);
    expect(uls[0]?.querySelectorAll('li').length).toBe(2);
    expect(ols[0]?.querySelectorAll('li').length).toBe(2);
  });

  it('renders fenced code blocks', () => {
    const { container } = render(
      <ProjectMarkdown source={'```\nconst x = 1;\n```'} />,
    );
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain('const x = 1;');
  });

  it('strips <script> and HTML tags as plain text', () => {
    render(
      <ProjectMarkdown
        source={
          'Evil payload: <script>alert("xss")</script> and <img src=x onerror=alert(1)>'
        }
      />,
    );
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
    expect(
      screen.getByText(/<script>alert\("xss"\)<\/script>/),
    ).toBeInTheDocument();
  });

  it('renders safe http(s) links with target=_blank', () => {
    render(
      <ProjectMarkdown
        source={'See [the spec](https://example.com) for details.'}
      />,
    );
    const a = screen.getByRole('link', { name: 'the spec' });
    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(a.getAttribute('target')).toBe('_blank');
  });

  it('refuses javascript: links and falls back to plain text', () => {
    const { container } = render(
      <ProjectMarkdown source={'Click [me](javascript:alert(1)) now.'} />,
    );
    // No anchor with javascript: href is emitted.
    const anchors = container.querySelectorAll('a');
    for (const a of anchors) {
      expect(a.getAttribute('href') ?? '').not.toMatch(/^javascript:/i);
    }
  });
});
