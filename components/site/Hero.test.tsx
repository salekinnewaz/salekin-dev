// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import {
  HERO_CAPABILITY_TAGS,
  HERO_CAPABILITY_CARDS,
  HERO_CORE_STACK,
} from '@/src/data/hero';

/**
 * The Hero's structural contract.
 *
 * These assertions cover the elements the hero is *required* to
 * carry — the availability badge, the capability tags, the three CTAs,
 * the four capability cards, the pipeline and the Core Stack — rather
 * than their exact pixel geometry, which the Playwright QA scripts in
 * `scripts/qa-hero*.mjs` measure in a real browser.
 */

describe('Hero', () => {
  it('shows the three CTAs', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /Hire Me/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /View Case Studies/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Resume Preview/i })).toBeTruthy();
  });

  it('hides the availability badge by default', () => {
    render(<Hero />);
    expect(screen.queryByText('Available for Work')).toBeNull();
  });

  it('shows the availability badge when the setting is on', () => {
    render(<Hero availableForWork />);
    expect(screen.getByText('Available for Work')).toBeTruthy();
  });

  it('keeps the ISTQB certification badge either way', () => {
    const { container, rerender } = render(<Hero />);
    const badge = () =>
      container.querySelector('.hero-badge-row')?.textContent ?? '';
    expect(badge()).toMatch(/ISTQB® Certified/);
    rerender(<Hero availableForWork />);
    expect(badge()).toMatch(/ISTQB® Certified/);
  });

  it('renders all four capability tags', () => {
    const { container } = render(<Hero />);
    const tags = [...container.querySelectorAll('.hero-cap-tag')].map(
      (t) => t.textContent?.trim(),
    );
    expect(tags).toEqual([
      'QA Engineering',
      'Test Automation',
      'Development',
      'Open Source',
    ]);
    expect(HERO_CAPABILITY_TAGS.map((t) => t.label)).toEqual(tags);
  });

  it('renders all four capability cards', () => {
    const { container } = render(<Hero />);
    expect(container.querySelectorAll('.hero-cap-card')).toHaveLength(4);
    const titles = [...container.querySelectorAll('.hero-cap-title')].map(
      (t) => t.textContent?.trim(),
    );
    expect(titles).toEqual(HERO_CAPABILITY_CARDS.map((c) => c.title));
  });

  it('renders all eight Core Stack badges in the required order', () => {
    const { container } = render(<Hero />);
    const labels = [...container.querySelectorAll('.hero-stack-badge')].map(
      (b) => b.textContent?.trim(),
    );
    expect(labels).toEqual(HERO_CORE_STACK.map((t) => t.name));
  });

  it('renders the four credibility metrics', () => {
    const { container } = render(<Hero />);
    const values = [...container.querySelectorAll('dt')].map(
      (dt) => dt.textContent?.trim(),
    );
    expect(values).toEqual(['5+', '4+', '3', '435+']);
  });

  it('links the npm metric to the published package', () => {
    render(<Hero />);
    const link = screen.getByRole('link', {
      name: /playwright-summary-reporter/i,
    });
    expect(link.getAttribute('href')).toBe(
      'https://www.npmjs.com/package/playwright-summary-reporter?activeTab=versions',
    );
  });

  it('shows the QA Pipeline with all four stages and the Passed status', () => {
    const { container } = render(<Hero />);
    expect(container.querySelectorAll('.hero-pipeline-check')).toHaveLength(4);
    expect(screen.getByText('QA Pipeline')).toBeTruthy();
    expect(screen.getByText('Passed')).toBeTruthy();
  });

  it('renders the portrait from the profile-image route', () => {
    const { container } = render(
      <Hero profileImage={{ position: '50% 30%', version: 'abc', mode: 'cutout' }} />,
    );
    const img = container.querySelector<HTMLImageElement>('#hero img');
    expect(img?.getAttribute('src')).toContain('/profile-image?v=abc');
  });

  it('keeps the portrait in photo mode when the admin picks it', () => {
    const { container } = render(
      <Hero profileImage={{ position: '50% 30%', version: 'abc', mode: 'photo' }} />,
    );
    expect(
      container.querySelector('.hero-portrait')?.getAttribute('data-mode'),
    ).toBe('photo');
  });
});
