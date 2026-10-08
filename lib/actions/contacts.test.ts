import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// revalidatePath requires a Next.js request context that doesn't exist in
// tests; stub it so the action can run end-to-end.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { markContactReadAction } from './contacts';
import { getTestDb } from '../../tests/helpers/db';

// Self-sufficient: each test seeds and wipes the contact table so we don't
// depend on data from prior test files or from prisma/seed.ts.

async function wipe() {
  await getTestDb().contact.deleteMany({});
}

async function makeContact(): Promise<{ id: string }> {
  const created = await getTestDb().contact.create({
    data: {
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello there from a real person.',
      read: false,
    },
  });
  return { id: created.id };
}

function formWithId(id: string): FormData {
  const fd = new FormData();
  fd.set('id', id);
  return fd;
}

describe('actions/contacts (markContactReadAction)', () => {
  beforeEach(wipe);
  afterEach(wipe);

  it('marks a contact as read by id', async () => {
    const { id } = await makeContact();
    const r = await markContactReadAction({ ok: false, error: '' }, formWithId(id));
    expect(r).toEqual({ ok: true });
    const after = await getTestDb().contact.findUnique({ where: { id } });
    expect(after?.read).toBe(true);
  });

  it('rejects an empty/missing id', async () => {
    const fd = new FormData();
    const r = await markContactReadAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/invalid id/i);
  });

  it('returns an error string (not a throw) when the id is unknown', async () => {
    const fd = new FormData();
    fd.set('id', 'does-not-exist');
    const r = await markContactReadAction({ ok: false, error: '' }, fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(typeof r.error).toBe('string');
  });
});