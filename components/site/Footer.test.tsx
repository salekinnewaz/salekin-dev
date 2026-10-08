// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

const baseIdentity = {
  siteTitle: 'Salekin Newaz',
  siteTagline: 'tag',
  siteSubtitle: '',
  siteInitials: 'SN',
  aboutBio: '',
  contactEmail: null,
  contactPhone: null,
  contactLocation: null,
  cvUrl: '/cv.pdf',
  socialGithub: null,
  socialLinkedin: null,
  socialFacebook: null,
  socialX: null,
};

describe('Footer', () => {
  it('renders the current year as a 4-digit number', () => {
    render(<Footer identity={baseIdentity} />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });

  it('renders the contact email as a mailto link when present', () => {
    render(
      <Footer
        identity={{ ...baseIdentity, contactEmail: 'hello@example.com' }}
      />,
    );
    const link = screen.getByRole('link', { name: 'hello@example.com' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('mailto:hello@example.com');
  });

  it('omits the email block when contact_email is null', () => {
    render(<Footer identity={baseIdentity} />);
    expect(screen.queryByRole('link', { name: /@/ })).toBeNull();
  });

  it('renders social links when provided', () => {
    render(
      <Footer
        identity={{
          ...baseIdentity,
          socialGithub: 'https://github.com/x',
          socialLinkedin: 'https://linkedin.com/in/x',
        }}
      />,
    );
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('omits social links that are null', () => {
    render(
      <Footer
        identity={{ ...baseIdentity, socialGithub: 'https://github.com/x' }}
      />,
    );
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.queryByText('LinkedIn')).toBeNull();
    expect(screen.queryByText('Facebook')).toBeNull();
    expect(screen.queryByText('X')).toBeNull();
  });
});