import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/queries/contacts', () => ({
  createContact: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Map<string, string>([
      ['x-forwarded-for', '203.0.113.1'],
    ]) as unknown as Headers,
  ),
}));

import { createContact } from '@/lib/queries/contacts';
import { submitContactAction } from './contact';
import { __resetRateLimitBucketsForTests } from '@/lib/security/rate-limit';

const mockedCreateContact = vi.mocked(createContact);

const validForm = () => {
  const fd = new FormData();
  fd.set('name', 'Ada Lovelace');
  fd.set('email', 'ada@example.com');
  fd.set('message', 'Hello there, this is a real message.');
  return fd;
};

describe('actions/contact', () => {
  beforeEach(() => {
    mockedCreateContact.mockReset();
    __resetRateLimitBucketsForTests();
  });

  it('returns ok on valid submission and calls createContact', async () => {
    mockedCreateContact.mockResolvedValue({ ok: true, id: 'abc123' });

    const result = await submitContactAction(
      { ok: false, error: '' },
      validForm(),
    );

    expect(result).toEqual({ ok: true });
    expect(mockedCreateContact).toHaveBeenCalledTimes(1);
    expect(mockedCreateContact).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello there, this is a real message.',
    });
  });

  it('returns error and skips createContact when email is invalid', async () => {
    const fd = validForm();
    fd.set('email', 'not-an-email');

    const result = await submitContactAction(
      { ok: false, error: '' },
      fd,
    );

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toMatch(/check the fields/i);
    }
    expect(mockedCreateContact).not.toHaveBeenCalled();
  });

  it('returns error and skips createContact when message is too short', async () => {
    const fd = validForm();
    fd.set('message', 'short');

    const result = await submitContactAction(
      { ok: false, error: '' },
      fd,
    );

    expect(result.ok).toBe(false);
    expect(mockedCreateContact).not.toHaveBeenCalled();
  });

  it('returns error and skips createContact when name is missing', async () => {
    const fd = validForm();
    fd.delete('name');

    const result = await submitContactAction(
      { ok: false, error: '' },
      fd,
    );

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toMatch(/check the fields/i);
    }
    expect(mockedCreateContact).not.toHaveBeenCalled();
  });

  it('propagates DB error messages from createContact', async () => {
    mockedCreateContact.mockResolvedValue({
      ok: false,
      error: 'database is on fire',
    });

    const result = await submitContactAction(
      { ok: false, error: '' },
      validForm(),
    );

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toBe('database is on fire');
    }
  });

  it('catches thrown errors from createContact and returns a safe message', async () => {
    mockedCreateContact.mockRejectedValue(new Error('boom'));

    const result = await submitContactAction(
      { ok: false, error: '' },
      validForm(),
    );

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toMatch(/something went wrong/i);
    }
  });

  it('rejects a FormData missing required fields', async () => {
    const fd = new FormData();
    fd.set('name', 'Ada');
    // email and message missing

    const result = await submitContactAction(
      { ok: false, error: '' },
      fd,
    );

    expect(result.ok).toBe(false);
    expect(mockedCreateContact).not.toHaveBeenCalled();
  });

  it('silently accepts (and skips persistence) when honeypot is filled', async () => {
    const fd = validForm();
    fd.set('website', 'http://spam.example.com');

    const result = await submitContactAction(
      { ok: false, error: '' },
      fd,
    );

    expect(result).toEqual({ ok: true });
    expect(mockedCreateContact).not.toHaveBeenCalled();
  });

  it('rate-limits after 5 submissions from the same IP within an hour', async () => {
    mockedCreateContact.mockResolvedValue({ ok: true, id: 'abc' });

    // Burn the 5 allowed hits.
    for (let i = 0; i < 5; i++) {
      const r = await submitContactAction({ ok: false, error: '' }, validForm());
      expect(r.ok).toBe(true);
    }

    // 6th submission is rejected.
    const result = await submitContactAction(
      { ok: false, error: '' },
      validForm(),
    );
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toMatch(/too many/i);
    }
    // Persistence was never called for the rejected 6th.
    expect(mockedCreateContact).toHaveBeenCalledTimes(5);
  });

  it('rejects payloads over the length cap', async () => {
    const fd = validForm();
    fd.set('name', 'a'.repeat(200));

    const result = await submitContactAction(
      { ok: false, error: '' },
      fd,
    );

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toMatch(/too long/i);
    }
    expect(mockedCreateContact).not.toHaveBeenCalled();
  });
});