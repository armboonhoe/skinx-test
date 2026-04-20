'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/app/posts/logout-action';

export function LogoutButton() {
  const [pending, start] = useTransition();

  return (
    <form action={() => start(() => logoutAction())}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:scale-95 disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Signing out…
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.22-.53l-3-3a.75.75 0 10-1.06 1.06L16.44 9.25H8.75a.75.75 0 000 1.5h7.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3A.75.75 0 0019 10z" clipRule="evenodd" />
            </svg>
            Sign out
          </>
        )}
      </button>
    </form>
  );
}
