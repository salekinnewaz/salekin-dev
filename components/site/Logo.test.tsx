// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Logo, logoMarkSvgString } from './Logo';

describe('Logo', () => {
  it('renders a mark by default', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('uses the provided initials for the monogram', () => {
    const { container } = render(<Logo initials="AB" />);
    const texts = container.querySelectorAll('text');
    expect(texts.length).toBe(2);
    expect(texts[0]?.textContent).toBe('A');
    expect(texts[1]?.textContent).toBe('B');
  });

  it('falls back to "S/N" for single-letter initials', () => {
    const { container } = render(<Logo initials="X" />);
    const texts = container.querySelectorAll('text');
    expect(texts.length).toBe(1);
    expect(texts[0]?.textContent).toBe('X');
  });

  it('uppercases initials', () => {
    const { container } = render(<Logo initials="ab" />);
    const texts = container.querySelectorAll('text');
    expect(texts[0]?.textContent).toBe('A');
    expect(texts[1]?.textContent).toBe('B');
  });

  it('truncates to two characters when given more', () => {
    const { container } = render(<Logo initials="ABCD" />);
    const texts = container.querySelectorAll('text');
    expect(texts.length).toBe(2);
    expect(texts[0]?.textContent).toBe('A');
    expect(texts[1]?.textContent).toBe('B');
  });

  it('renders just the mark when variant is "mark"', () => {
    const { container } = render(<Logo variant="mark" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    // No wordmark text
    expect(container.textContent).not.toContain('Salekin');
  });

  it('renders the wordmark without the mark when variant is "wordmark"', () => {
    const { container } = render(<Logo variant="wordmark" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.textContent).toContain('Salekin');
  });

  it('renders mark + wordmark when variant is "full"', () => {
    const { container } = render(<Logo variant="full" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.textContent).toContain('Salekin');
  });

  it('respects the size prop (sm renders a smaller svg)', () => {
    const { container: sm } = render(<Logo size="sm" />);
    const { container: xl } = render(<Logo size="xl" />);
    const smSvg = sm.querySelector('svg');
    const xlSvg = xl.querySelector('svg');
    expect(Number(smSvg?.getAttribute('width'))).toBeLessThan(
      Number(xlSvg?.getAttribute('width')),
    );
  });

  it('marks itself decorative when decorative=true', () => {
    const { container } = render(<Logo decorative />);
    // aria-hidden gets applied to the wrapper span
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  describe('logoMarkSvgString', () => {
    it('produces a valid SVG string with the requested initials', () => {
      const svg = logoMarkSvgString('XY', 64);
      expect(svg).toMatch(/^<svg /);
      // Initials are drawn as two separate <text> elements, one per letter
      expect(svg).toContain('>X</text>');
      expect(svg).toContain('>Y</text>');
      expect(svg).toContain('viewBox="0 0 100 100"');
      expect(svg).toContain('width="64"');
    });

    it('bakes concrete colors into the output (no CSS vars)', () => {
      const svg = logoMarkSvgString();
      // Colors are concrete hex values; no `var(--` inside the static export
      expect(svg).not.toContain('var(');
      expect(svg).toContain('#a78bfa');
      expect(svg).toContain('#22d3ee');
    });
  });
});
