import 'server-only';
import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'skinx_token';

export const getAuthToken = async (): Promise<string | null> => {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
};

const cookieBaseOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const setAuthCookie = async (token: string): Promise<void> => {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    ...cookieBaseOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
};

export const clearAuthCookie = async (): Promise<void> => {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, '', { ...cookieBaseOptions, maxAge: 0 });
};
