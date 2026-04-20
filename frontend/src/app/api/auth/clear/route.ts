import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

// Route Handler so cookies can be mutated (layouts/pages can't).
// Called when the backend rejects a stale token — we clear the cookie
// and bounce the user to /login.
export const GET = async (req: Request): Promise<NextResponse> => {
  const url = new URL('/login', req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.delete(AUTH_COOKIE);
  return res;
};
