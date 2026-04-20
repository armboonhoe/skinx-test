'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { api, ApiRequestError } from '@/lib/api';
import { setAuthCookie } from '@/lib/auth';

const schema = z.object({
  email: z.string().email('Please enter a valid email.').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol.'),
  name: z.string().trim().min(1).max(100).optional(),
});

export interface ActionState {
  error?: string;
}

const extractBackendMessage = (err: ApiRequestError): string | null => {
  const details = err.body.error?.details;
  if (details && typeof details === 'object') {
    // Zod flatten shape from the backend: { fieldErrors: { password: [...] } } OR { password: [...] }
    const fieldErrors = (details as { fieldErrors?: Record<string, string[]> }).fieldErrors
      ?? (details as Record<string, string[]>);
    for (const field of ['password', 'email', 'name'] as const) {
      const msgs = fieldErrors[field];
      if (Array.isArray(msgs) && msgs.length > 0) return msgs[0];
    }
  }
  return err.body.error?.message ?? null;
};

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  try {
    const { token } = await api.auth.register(parsed.data);
    await setAuthCookie(token);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.status === 409) return { error: 'Email is already registered.' };
      if (err.status === 429) return { error: 'Too many attempts. Please try again later.' };
      if (err.status === 400) {
        const msg = extractBackendMessage(err);
        return { error: msg ?? 'Please check your input and try again.' };
      }
    }
    return { error: 'Could not create account. Please try again.' };
  }

  redirect('/posts');
}
