import { z } from 'zod';

/**
 * Shared contact-form schema. Used by:
 * - lib/queries/contacts.ts (server-side validation before DB write)
 * - Bolt 3: react-hook-form resolver on the client
 */
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message is too long'),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function parseContact(input: unknown): ContactInput {
  return contactSchema.parse(input);
}

export function safeParseContact(
  input: unknown,
):
  | { success: true; data: ContactInput }
  | { success: false; error: z.ZodError } {
  return contactSchema.safeParse(input);
}
