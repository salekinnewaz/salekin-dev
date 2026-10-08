import { describe, it, expect, beforeEach } from 'vitest';
import { createContact } from './contacts';
import { getTestDb, closeTestDb } from '../../tests/helpers/db';

describe('queries/contacts', () => {
  beforeEach(async () => {
    await getTestDb().contact.deleteMany();
  });

  it('createContact persists a valid submission', async () => {
    const result = await createContact({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello, I would like to chat about a thing.',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.id).toBe('string');
      const stored = await getTestDb().contact.findUnique({
        where: { id: result.id },
      });
      expect(stored?.name).toBe('Ada Lovelace');
      expect(stored?.read).toBe(false);
    }
  });

  it('createContact rejects short message', async () => {
    const result = await createContact({
      name: 'Bob',
      email: 'bob@example.com',
      message: 'short',
    });
    expect(result.ok).toBe(false);
  });

  it('createContact rejects invalid email', async () => {
    const result = await createContact({
      name: 'Bob',
      email: 'not-an-email',
      message: 'long enough message here',
    });
    expect(result.ok).toBe(false);
  });

  it('createContact rejects empty name', async () => {
    const result = await createContact({
      name: '',
      email: 'b@b.com',
      message: 'a long enough message',
    });
    expect(result.ok).toBe(false);
  });

  it('createContact handles garbage input gracefully', async () => {
    // intentionally cast to a sentinel for the test
    const result = await createContact('not an object');
    expect(result.ok).toBe(false);
  });
});

describe('queries/contacts (cleanup)', () => {
  it('disconnects', async () => {
    await closeTestDb();
  });
});