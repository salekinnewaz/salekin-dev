'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { markContactRead } from '@/lib/queries/contacts';

const idSchema = z.object({ id: z.string().min(1).max(40) });

export type MarkContactReadState =
  | { ok: true }
  | { ok: false; error: string };

export async function markContactReadAction(
  _prev: MarkContactReadState,
  formData: FormData,
): Promise<MarkContactReadState> {
  const parsed = idSchema.safeParse({ id: formData.get('id') });
  if (!parsed.success) {
    return { ok: false, error: 'Invalid id' };
  }
  try {
    await markContactRead(parsed.data.id);
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    console.error('markContactRead failed:', err);
    return { ok: false, error: 'Could not update the message.' };
  }
}