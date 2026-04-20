import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/LogoutButton';
import { api, ApiRequestError } from '@/lib/api';

// Layout depends on the user's JWT cookie, so it's dynamic by nature —
// no need for `force-dynamic` (which can suppress notFound()'s 404 status).

export default async function PostsLayout({ children }: { children: ReactNode }) {
  let userLabel = 'Account';
  let initial = '?';
  try {
    const { user } = await api.auth.me();
    userLabel = user.name ?? user.email;
    initial = (user.name ?? user.email).charAt(0).toUpperCase();
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      redirect('/api/auth/clear');
    }
    throw err;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-ink-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/posts"
            className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/30 transition group-hover:shadow-lg group-hover:shadow-primary-500/40">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight text-ink-900">
              SkinX<span className="text-primary-500">.</span>Posts
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-full border border-ink-200 bg-white/80 px-3 py-1 text-sm sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-primary-600 text-[11px] font-bold text-white">
                {initial}
              </span>
              <span className="font-medium text-ink-700">{userLabel}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
