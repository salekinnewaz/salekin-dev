import { describe, it, expect } from 'vitest';
import {
  contactSchema,
  parseContact,
  safeParseContact,
} from './contact';

describe('validation/contact', () => {
  const valid = {
    name: 'Alice',
    email: 'alice@example.com',
    message: 'Hi there, this is a real message.',
  };

  it('accepts a well-formed payload', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'nope' });
    expect(result.success).toBe(false);
  });

  it('rejects short message', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects missing field', () => {
    const result = contactSchema.safeParse({ name: valid.name, email: valid.email });
    expect(result.success).toBe(false);
  });

  it('rejects oversize name', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects oversize message', () => {
    const result = contactSchema.safeParse({
      ...valid,
      message: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('parseContact throws on invalid input', () => {
    expect(() => parseContact({ ...valid, email: 'nope' })).toThrow();
  });

  it('safeParseContact returns the data on success', () => {
    const result = safeParseContact(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe(valid.email);
    }
  });
});