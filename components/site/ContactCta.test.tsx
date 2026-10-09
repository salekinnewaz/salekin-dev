// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactCta } from './ContactCta';

const identity = {
  siteTitle: 'Salekin Newaz',
  siteTagline: '',
  siteSubtitle: '',
  siteInitials: 'SN',
  aboutBio: '',
  contactEmail: 'me@example.com',
  contactPhone: '+1 555 555 5555',
  contactLocation: 'Dhaka, Bangladesh',
  cvUrl: '/cv.pdf',
  socialGithub: 'https://github.com/x',
  socialLinkedin: 'https://linkedin.com/in/x',
  socialFacebook: null,
  socialX: null,
};

describe('ContactCta', () => {
  it('renders the eyebrow and heading', () => {
    render(<ContactCta identity={identity} />);
    expect(screen.getByText(/let.{0,3}s connect/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /get in touch/i }),
    ).toBeInTheDocument();
  });

  it('shows location, email, and phone from identity', () => {
    render(<ContactCta identity={identity} />);
    expect(screen.getByText(/Dhaka, Bangladesh/)).toBeInTheDocument();
    const emailLink = screen.getByRole('link', { name: 'me@example.com' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.getAttribute('href')).toBe('mailto:me@example.com');
    const phoneLink = screen.getByRole('link', { name: /\+1 555/ });
    expect(phoneLink.getAttribute('href')).toBe('tel:+15555555555');
  });

  it('hides fields that are null', () => {
    render(
      <ContactCta
        identity={{
          ...identity,
          contactPhone: null,
          contactLocation: null,
        }}
      />,
    );
    expect(screen.queryByText(/Dhaka, Bangladesh/)).toBeNull();
    expect(screen.queryByRole('link', { name: /\+1 555/ })).toBeNull();
  });

  it('links the send-a-message button to the contact anchor', () => {
    render(<ContactCta identity={identity} />);
    const link = screen.getByRole('link', { name: /send a message/i });
    expect(link.getAttribute('href')).toBe('#contact');
  });
});
