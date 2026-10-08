import { db } from '../db';
import { parseContact, type ContactInput } from '../validation/contact';

export type CreateContactResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  read: boolean;
};

/**
 * Validate and persist a contact submission. Throws ZodError on invalid input
 * (callers should use `safeParseContact` first if they want to surface
 * field-level errors — this function is the write boundary and is strict).
 */
export async function createContact(raw: unknown): Promise<CreateContactResult> {
  let input: ContactInput;
  try {
    input = parseContact(raw);
  } catch {
    return { ok: false, error: 'Invalid contact submission' };
  }
  const created = await db.contact.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
    },
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

/** Most recent contact submissions, newest first. Admin-only. */
export async function listContacts(limit = 50): Promise<ContactMessage[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
  const rows = await db.contact.findMany({
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      createdAt: true,
      read: true,
    },
  });
  return rows;
}

export async function markContactRead(id: string): Promise<void> {
  await db.contact.update({
    where: { id },
    data: { read: true },
  });
}
