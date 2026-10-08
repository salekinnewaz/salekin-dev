// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/actions/contact', () => ({
  submitContactAction: vi.fn(),
}));

import { submitContactAction } from '@/lib/actions/contact';
import { ContactForm } from './ContactForm';

const mockedAction = vi.mocked(submitContactAction);

describe('ContactForm', () => {
  beforeEach(() => {
    mockedAction.mockReset();
    // Default to a benign success so submit() doesn't go into a retry loop.
    mockedAction.mockResolvedValue({ ok: false, error: '' });
  });

  it('renders name, email, message inputs and a submit button', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send/i }),
    ).toBeInTheDocument();
  });

  it('shows field-level errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByTestId('contact-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('contact-email-error')).toBeInTheDocument();
      expect(screen.getByTestId('contact-message-error')).toBeInTheDocument();
    });

    // No server action call when client-side validation fails.
    expect(mockedAction).not.toHaveBeenCalled();
  });

  it('shows only the email error for an otherwise-valid payload', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(
      screen.getByLabelText(/message/i),
      'This is a long enough message.',
    );

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByTestId('contact-email-error')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('contact-name-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-message-error')).not.toBeInTheDocument();
  });

  it('submits valid data and shows the success message', async () => {
    mockedAction.mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(
      screen.getByLabelText(/message/i),
      'Hello there, this is a real message.',
    );

    await user.click(screen.getByRole('button', { name: /send/i }));

    const success = await screen.findByTestId('contact-success');
    expect(success).toHaveTextContent(/message sent/i);
  });

  it('calls the server action with the form data on a valid submit', async () => {
    mockedAction.mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'Grace Hopper');
    await user.type(screen.getByLabelText(/email/i), 'grace@example.com');
    await user.type(
      screen.getByLabelText(/message/i),
      'A really nice long-form message goes here.',
    );

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockedAction).toHaveBeenCalled();
    });

    // The action was called with a FormData-like value and an initial state.
    const call = mockedAction.mock.calls[0];
    expect(call).toBeDefined();
    const [prevState, formData] = call!;
    expect(prevState).toEqual({ ok: false, error: '' });
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get('name')).toBe('Grace Hopper');
    expect((formData as FormData).get('email')).toBe('grace@example.com');
    expect((formData as FormData).get('message')).toBe(
      'A really nice long-form message goes here.',
    );
  });

  it('shows a server error when the action returns ok=false with a message', async () => {
    mockedAction.mockResolvedValue({
      ok: false,
      error: 'database is on fire',
    });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(
      screen.getByLabelText(/message/i),
      'Hello there, this is a real message.',
    );

    await user.click(screen.getByRole('button', { name: /send/i }));

    const err = await screen.findByTestId('contact-server-error');
    expect(err).toHaveTextContent(/database is on fire/i);
  });
});