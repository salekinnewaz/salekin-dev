// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

const identity = {
  siteTitle: 'Md Salekin Newaz',
  siteTagline: '',
  siteSubtitle: '',
  siteInitials: 'SN',
  aboutBio: '',
  contactEmail: 'me@example.com',
  contactPhone: null,
  contactLocation: null,
  cvUrl: '/cv.pdf',
  socialGithub: 'https://github.com/x',
  socialLinkedin: 'https://linkedin.com/in/x',
  socialFacebook: null,
  socialX: null,
};

describe('SiteFooter', () => {
  it('renders the current year in the copyright line', () => {
    render(<SiteFooter identity={identity} />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year} Md Salekin Newaz`)),
    ).toBeInTheDocument();
  });

  it('renders nav links to all primary sections', () => {
    render(<SiteFooter identity={identity} />);
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Experience' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Recommendations' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Stack' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders social icon links when present', () => {
    render(<SiteFooter identity={identity} />);
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
  });

  it('omits the email social icon when no email is set', () => {
    render(
      <SiteFooter identity={{ ...identity, contactEmail: null }} />,
    );
    expect(screen.queryByRole('link', { name: 'Email' })).toBeNull();
  });
});
