// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

import { redirect } from 'next/navigation';
import ContactPage from './page';

describe('ContactPage (redirect)', () => {
  it('redirects to /#contact', async () => {
    await ContactPage();
    expect(redirect).toHaveBeenCalledWith('/#contact');
  });
});