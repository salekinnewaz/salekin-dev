// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Recommendations } from './Recommendations';
import {
  RECOMMENDATIONS,
  type Recommendation,
} from '@/lib/site/recommendations';

const SAMPLE: Recommendation[] = [
  {
    id: 'sample-1',
    quote:
      'Salekin is a dedicated QA engineer with strong automation skills.',
    name: 'Rahul Ahmed',
    role: 'Engineering Manager',
    company: 'Brain Station 23',
    photoUrl: null,
    linkedinUrl: 'https://www.linkedin.com/in/rahul-ahmed-example',
    date: 'Mar 2024',
  },
  {
    id: 'sample-2',
    quote:
      'Proactive, technically strong, and always open to learning. Great teammate.',
    name: 'Nusrat Jahan',
    role: 'Product Owner',
    company: 'Brain Station 23',
    photoUrl: null,
    linkedinUrl: null,
    date: null,
  },
];

describe('Recommendations', () => {
  beforeEach(() => {
    // Reset the data array between tests so the empty-state tests
    // aren't polluted by other tests' mutations.
    RECOMMENDATIONS.length = 0;
  });

  it('shows the empty-state placeholder when no recommendations are configured', () => {
    render(<Recommendations />);
    expect(screen.getByTestId('recommendations-empty')).toBeInTheDocument();
    expect(
      screen.getByText(/real recommendations are on the way/i),
    ).toBeInTheDocument();
  });

  it('renders the section eyebrow and heading', () => {
    render(<Recommendations />);
    expect(screen.getByText(/trust .{0,3} recognition/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /what people say/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a few words from people i.{0,3}ve worked with/i),
    ).toBeInTheDocument();
  });

  it('renders the LinkedIn CTA even in the empty state', () => {
    render(<Recommendations />);
    const cta = screen.getByRole('link', {
      name: /read all recommendations on linkedin/i,
    });
    expect(cta).toBeInTheDocument();
    expect(cta.getAttribute('href')).toBe(
      'https://www.linkedin.com/in/md-salekin-newaz',
    );
    expect(cta.getAttribute('target')).toBe('_blank');
    expect(cta.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders a card per provided recommendation', () => {
    RECOMMENDATIONS.push(...SAMPLE);
    render(<Recommendations />);
    expect(
      screen.getByText(/Salekin is a dedicated QA engineer/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Rahul Ahmed')).toBeInTheDocument();
    expect(screen.getByText('Nusrat Jahan')).toBeInTheDocument();
    // Empty state must NOT be present when there are items.
    expect(screen.queryByTestId('recommendations-empty')).toBeNull();
  });

  it('limits the number of cards to the `limit` prop', () => {
    RECOMMENDATIONS.push(...SAMPLE);
    render(<Recommendations limit={1} />);
    expect(screen.getByText('Rahul Ahmed')).toBeInTheDocument();
    expect(screen.queryByText('Nusrat Jahan')).toBeNull();
  });

  it('shows the recommender role and company beneath the name', () => {
    RECOMMENDATIONS.push(SAMPLE[0]!);
    render(<Recommendations />);
    expect(
      screen.getByText(/Engineering Manager/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Brain Station 23/i)).toBeInTheDocument();
  });

  it('renders a per-recommendation LinkedIn icon when linkedinUrl is set', () => {
    RECOMMENDATIONS.push(SAMPLE[0]!, SAMPLE[1]!);
    render(<Recommendations />);
    // Only the first sample has a linkedinUrl; the per-recommendation
    // links are labelled "Rahul Ahmed on LinkedIn" (we match on the
    // recommender's name to skip the main "Read All Recommendations
    // on LinkedIn" CTA).
    const rahulLink = screen.getByRole('link', {
      name: /rahul ahmed on linkedin/i,
    });
    expect(rahulLink).toBeInTheDocument();
    expect(rahulLink.getAttribute('href')).toBe(
      'https://www.linkedin.com/in/rahul-ahmed-example',
    );
    // The second sample has no linkedinUrl — no per-recommendation link.
    expect(
      screen.queryByRole('link', { name: /nusrat jahan on linkedin/i }),
    ).toBeNull();
  });

  it('uses id="recommendations" so the nav pill can scroll to it', () => {
    const { container } = render(<Recommendations />);
    expect(container.querySelector('#recommendations')).not.toBeNull();
  });
});
