// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutMe } from './AboutMe';

const identity = {
  siteTitle: 'Md Salekin Newaz',
  siteTagline: '',
  siteSubtitle: '',
  siteInitials: 'SN',
  aboutBio: 'First paragraph about me.\n\nSecond paragraph about me.',
  contactEmail: null,
  contactPhone: null,
  contactLocation: null,
  cvUrl: '/cv.pdf',
  socialGithub: null,
  socialLinkedin: null,
  socialFacebook: null,
  socialX: null,
};

describe('AboutMe', () => {
  it('renders the eyebrow and heading', () => {
    render(<AboutMe identity={identity} />);
    // "about me" is also in the link text, so use a heading role match
    // against the eyebrow via its unique class to be precise.
    const eyebrow = screen.getByText(/^about me$/i);
    expect(eyebrow).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /quality.?driven engineering/i,
      }),
    ).toBeInTheDocument();
  });

  it('splits a multi-paragraph bio on blank lines', () => {
    render(<AboutMe identity={identity} />);
    expect(screen.getByText(/First paragraph about me\./)).toBeInTheDocument();
    expect(screen.getByText(/Second paragraph about me\./)).toBeInTheDocument();
  });

  it('limits the bio to two paragraphs on the home page', () => {
    const longIdentity = {
      ...identity,
      aboutBio: 'A\n\nB\n\nC\n\nD',
    };
    render(<AboutMe identity={longIdentity} />);
    expect(screen.queryByText('C')).toBeNull();
    expect(screen.queryByText('D')).toBeNull();
  });

  it('links to /about when the visitor wants more', () => {
    render(<AboutMe identity={identity} />);
    const link = screen.getByRole('link', { name: /more about me/i });
    expect(link.getAttribute('href')).toBe('/about');
  });

  it('omits the bio block when no bio is configured', () => {
    render(<AboutMe identity={{ ...identity, aboutBio: '' }} />);
    expect(screen.queryByTestId('about-bio')).toBeNull();
  });
});
