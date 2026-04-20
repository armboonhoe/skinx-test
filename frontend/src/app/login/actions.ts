'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { api, ApiRequestError } from '@/lib/api';
import { setAuthCookie } from '@/lib/auth';

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
  next: z.string().optional(),
});

export interface ActionState {
  error?: string;
}

const safeNext = (candidate: string | undefined): string => {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return '/posts';
  return candidate;
};

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') ?? undefined,
  });

  if (!parsed.success) {
    return { error: 'Please enter a valid email and password.' };
  }

  let nextPath = '/posts';
  try {
    const { token } = await api.auth.login({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    await setAuthCookie(token);
    nextPath = safeNext(parsed.data.next);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      return { error: 'Invalid email or password.' };
    }
    if (err instanceof ApiRequestError && err.status === 429) {
      return { error: 'Too many attempts. Please try again later.' };
    }
    return { error: 'Could not sign in. Please try again.' };
  }

  redirect(nextPath);
}
