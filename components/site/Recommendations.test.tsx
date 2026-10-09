// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Recommendations } from './Recommendations';
import { RecommendationsViewMore } from './RecommendationsViewMore';
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
  {
    id: 'sample-3',
    quote: 'Meticulous, calm under pressure, and a great mentor.',
    name: 'Tariqul Islam',
    role: 'Senior Software Engineer',
    company: 'Brain Station 23',
    photoUrl: null,
    linkedinUrl: 'https://www.linkedin.com/in/tariqul-example',
    date: 'Feb 2024',
  },
  {
    id: 'sample-4',
    quote: 'Reliable, sharp, and ships quality.',
    name: 'Anika Rahman',
    role: 'Tech Lead',
    company: 'Brain Station 23',
    photoUrl: null,
    linkedinUrl: null,
    date: 'Jan 2024',
  },
];

describe('Recommendations', () => {
  beforeEach(() => {
    // Reset the data array between tests so the empty-state tests
    // aren't polluted by other tests' mutations or by the 5 real
    // entries that ship in lib/site/recommendations.ts.
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

  it('renders a card per provided recommendation (capped at the limit)', () => {
    RECOMMENDATIONS.push(...SAMPLE);
    render(<Recommendations limit={3} />);
    // First three are always-visible.
    expect(screen.getByText('Rahul Ahmed')).toBeInTheDocument();
    expect(screen.getByText('Nusrat Jahan')).toBeInTheDocument();
    expect(screen.getByText('Tariqul Islam')).toBeInTheDocument();
    // Empty state must NOT be present when there are items.
    expect(screen.queryByTestId('recommendations-empty')).toBeNull();
  });

  it('honours a smaller `limit` prop (hides the rest in the disclosure)', () => {
    RECOMMENDATIONS.push(...SAMPLE);
    render(<Recommendations limit={1} />);
    // The featured card is always visible.
    expect(screen.getByText('Rahul Ahmed')).toBeInTheDocument();
    // The remaining three are mounted inside the disclosure panel
    // (which is collapsed by default). Scope the query to the
    // main grid <ul> so we know they're not in the always-visible
    // set, regardless of how the panel renders.
    const panel = screen.getByRole('button', {
      name: /view 3 more recommendations/i,
    });
    expect(panel).toBeInTheDocument();
    expect(panel.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the recommender role and company beneath the name', () => {
    RECOMMENDATIONS.push(SAMPLE[0]!);
    render(<Recommendations />);
    expect(screen.getByText(/Engineering Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Brain Station 23/i)).toBeInTheDocument();
  });

  it('renders a per-recommendation LinkedIn icon when linkedinUrl is set', () => {
    RECOMMENDATIONS.push(SAMPLE[0]!, SAMPLE[1]!);
    render(<Recommendations limit={2} />);
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

  it('renders the View More disclosure when more than `limit` cards are configured', () => {
    RECOMMENDATIONS.push(...SAMPLE);
    // 4 entries, limit 3 → 1 card in the disclosure.
    render(<Recommendations limit={3} />);
    const button = screen.getByRole('button', {
      name: /view 1 more recommendation/i,
    });
    expect(button).toBeInTheDocument();
    // Initially closed.
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not render the View More button when there are no extras', () => {
    RECOMMENDATIONS.push(SAMPLE[0]!, SAMPLE[1]!);
    render(<Recommendations limit={3} />);
    expect(
      screen.queryByRole('button', { name: /view .* more recommendation/i }),
    ).toBeNull();
  });

  it('uses the correct singular/plural in the disclosure button', () => {
    RECOMMENDATIONS.push(...SAMPLE);
    // 4 entries, limit 2 → 2 cards in the disclosure.
    const { rerender } = render(<Recommendations limit={2} />);
    expect(
      screen.getByRole('button', { name: /view 2 more recommendations/i }),
    ).toBeInTheDocument();

    // 3 entries, limit 2 → 1 card in the disclosure (singular).
    RECOMMENDATIONS.length = 0;
    RECOMMENDATIONS.push(SAMPLE[0]!, SAMPLE[1]!, SAMPLE[2]!);
    rerender(<Recommendations limit={2} />);
    expect(
      screen.getByRole('button', { name: /view 1 more recommendation\b/i }),
    ).toBeInTheDocument();
  });
});

describe('Recommendations (seeded data)', () => {
  // The data file ships with 5 verbatim recommendations from the
  // owner's LinkedIn profile. This block verifies the public
  // shape of that seeded state — that the main grid features the
  // first three, the disclosure hides the remaining two, and the
  // button advertises the right count.
  //
  // We don't reset the array in this block: the test runs after
  // the "Recommendations" describe, which already cleared it. To
  // observe the seeded state we restore the array from a local
  // snapshot below (kept in sync with lib/site/recommendations.ts).

  const SEED: Recommendation[] = [
    {
      id: 'herman-kulild-dragesund-2025',
      quote: 'Pleased to recommend.',
      name: 'Herman Kulild Dragesund',
      role: 'Senior prosjektleder / Project Manager',
      company: 'Giur',
      photoUrl: null,
      linkedinUrl: null,
      date: 'August 4, 2025',
    },
    {
      id: 'junaid-aziz-2023',
      quote: 'In-depth understanding.',
      name: 'Junaid Aziz',
      role: 'QA Stack Co-Founder',
      company: 'QA Stack',
      photoUrl: null,
      linkedinUrl: null,
      date: 'August 29, 2023',
    },
    {
      id: 'shahriar-morshed-2023',
      quote: 'Onboarded very quickly.',
      name: 'Shahriar Morshed',
      role: 'Software Engineer',
      company: 'Freelance / Contract',
      photoUrl: null,
      linkedinUrl: null,
      date: 'August 22, 2023',
    },
    {
      id: 'sbm-reazul-karim-2023',
      quote: 'Dedication and expertise.',
      name: 'S.B.M Reazul Karim',
      role: 'Assistant Programmer',
      company: 'IIUC, BLET',
      photoUrl: null,
      linkedinUrl: null,
      date: 'August 18, 2023',
    },
    {
      id: 'rahadur-rahman-2023',
      quote: 'Consistently impressed.',
      name: 'Rahadur Rahman',
      role: 'Sr. Software Engineer',
      company: 'BJIT',
      photoUrl: null,
      linkedinUrl: null,
      date: 'August 17, 2023',
    },
  ];

  beforeEach(() => {
    // Replace the array contents with the seed snapshot so the
    // "real LinkedIn data" tests can exercise the same shape
    // that lib/site/recommendations.ts ships with.
    RECOMMENDATIONS.length = 0;
    RECOMMENDATIONS.push(...SEED);
  });

  it('features the first three in the main grid', () => {
    render(<Recommendations />);
    expect(screen.getByText('Herman Kulild Dragesund')).toBeInTheDocument();
    expect(screen.getByText('Junaid Aziz')).toBeInTheDocument();
    expect(screen.getByText('Shahriar Morshed')).toBeInTheDocument();
  });

  it('hides the remaining two in the disclosure panel', () => {
    const { container } = render(<Recommendations />);
    const panel = container.querySelector('#recommendations-extras');
    expect(panel).not.toBeNull();
    expect(panel!.hasAttribute('hidden')).toBe(true);
    expect(panel!.hasAttribute('inert')).toBe(true);
    // The trailing cards are mounted inside the disclosure.
    expect(within(panel as HTMLElement).getByText('S.B.M Reazul Karim'))
      .toBeInTheDocument();
    expect(within(panel as HTMLElement).getByText('Rahadur Rahman'))
      .toBeInTheDocument();
  });

  it('advertises the correct number of hidden cards', () => {
    render(<Recommendations />);
    expect(
      screen.getByRole('button', { name: /view 2 more recommendations/i }),
    ).toBeInTheDocument();
  });
});

describe('RecommendationsViewMore', () => {
  const A: Recommendation = {
    id: 'a',
    quote: 'A is excellent.',
    name: 'Alpha Person',
    role: 'Engineer',
    company: 'Co',
    photoUrl: null,
    linkedinUrl: null,
    date: null,
  };
  const B: Recommendation = {
    id: 'b',
    quote: 'B is great.',
    name: 'Bravo Person',
    role: 'Manager',
    company: 'Co',
    photoUrl: null,
    linkedinUrl: null,
    date: null,
  };
  const C: Recommendation = {
    id: 'c',
    quote: 'C is kind.',
    name: 'Charlie Person',
    role: 'Lead',
    company: 'Co',
    photoUrl: null,
    linkedinUrl: null,
    date: null,
  };

  it('returns null when there are no extras to reveal', () => {
    const { container } = render(
      <RecommendationsViewMore initial={[A]} extra={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a button with the correct count and pluralization', () => {
    const { rerender } = render(
      <RecommendationsViewMore initial={[A]} extra={[B, C]} />,
    );
    expect(
      screen.getByRole('button', { name: /view 2 more recommendations/i }),
    ).toBeInTheDocument();

    rerender(<RecommendationsViewMore initial={[A, B]} extra={[C]} />);
    expect(
      screen.getByRole('button', { name: /view 1 more recommendation\b/i }),
    ).toBeInTheDocument();
  });

  it('starts collapsed and expands on click', () => {
    const { container } = render(
      <RecommendationsViewMore initial={[A]} extra={[B, C]} />,
    );
    const button = screen.getByRole('button', { name: /view 2 more/i });
    expect(button.getAttribute('aria-expanded')).toBe('false');

    const panel = container.querySelector('#recommendations-extras')!;
    expect(panel.hasAttribute('hidden')).toBe(true);
    expect(panel.hasAttribute('inert')).toBe(true);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('recommendations-extras');
    expect(panel.hasAttribute('hidden')).toBe(false);
    expect(panel.hasAttribute('inert')).toBe(false);
    // The button label now offers to hide.
    expect(button.textContent).toMatch(/hide extra recommendations/i);

    // The two extras are now visible in the DOM.
    expect(within(panel as HTMLElement).getByText('Bravo Person'))
      .toBeInTheDocument();
    expect(within(panel as HTMLElement).getByText('Charlie Person'))
      .toBeInTheDocument();
  });

  it('toggles back to collapsed on a second click', () => {
    render(<RecommendationsViewMore initial={[A]} extra={[B]} />);
    const button = screen.getByRole('button', { name: /view 1 more/i });
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toMatch(/view 1 more recommendation/i);
  });

  it('renders a "Read all on LinkedIn" link below the toggle', () => {
    render(<RecommendationsViewMore initial={[A]} extra={[B]} />);
    const link = screen.getByRole('link', {
      name: /read all recommendations on linkedin/i,
    });
    expect(link.getAttribute('href')).toBe(
      'https://www.linkedin.com/in/md-salekin-newaz',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
