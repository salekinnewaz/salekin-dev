// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders a mark by default', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('uses the public logo asset for the mark', () => {
    const { container } = render(<Logo variant="mark" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/images/logo.png');
  });

  it('uses the provided label for the alt text', () => {
    const { container } = render(<Logo initials="AB" variant="mark" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('AB logo');
  });

  it('renders just the mark when variant is "mark"', () => {
    const { container } = render(<Logo variant="mark" />);
    expect(container.querySelector('img')).toBeInTheDocument();
    // No wordmark text
    expect(container.textContent).not.toContain('Salekin');
  });

  it('renders the wordmark without the mark when variant is "wordmark"', () => {
    const { container } = render(<Logo variant="wordmark" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.textContent).toContain('Salekin');
  });

  it('renders mark + wordmark when variant is "full"', () => {
    const { container } = render(<Logo variant="full" />);
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.textContent).toContain('Salekin');
  });

  it('respects the size prop (sm renders a smaller img)', () => {
    const { container: sm } = render(<Logo size="sm" variant="mark" />);
    const { container: xl } = render(<Logo size="xl" variant="mark" />);
    const smImg = sm.querySelector('img');
    const xlImg = xl.querySelector('img');
    expect(Number(smImg?.getAttribute('width'))).toBeLessThan(
      Number(xlImg?.getAttribute('width')),
    );
  });

  it('marks itself decorative when decorative=true', () => {
    const { container } = render(<Logo decorative />);
    // aria-hidden gets applied to the wrapper span
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });
});
