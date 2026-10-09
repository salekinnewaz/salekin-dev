// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CertificationsAndEducation } from './CertificationsAndEducation';

const education = [
  {
    id: 'ed1',
    institution: 'International Islamic University Chittagong',
    degree: 'BSc in Computer Science & Engineering',
    startYear: 2016,
    endYear: 2020,
    description: null,
    sortOrder: 1,
  },
];

describe('CertificationsAndEducation', () => {
  it('renders the ISTQB headline and a few secondary trainings', () => {
    render(<CertificationsAndEducation education={[]} />);
    expect(screen.getByText(/ISTQB® Certified/i)).toBeInTheDocument();
  });

  it('renders each education row from props', () => {
    render(<CertificationsAndEducation education={education} />);
    expect(
      screen.getByText(/BSc in Computer Science & Engineering/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/International Islamic University Chittagong/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/2016 .* 2020/)).toBeInTheDocument();
  });

  it('falls back gracefully when no education rows are provided', () => {
    render(<CertificationsAndEducation education={[]} />);
    expect(
      screen.queryByText(/No education rows configured/i),
    ).toBeInTheDocument();
  });
});
