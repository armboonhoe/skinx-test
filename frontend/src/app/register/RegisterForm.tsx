'use client';

import { useActionState } from 'react';
import { registerAction, type ActionState } from './actions';

const initialState: ActionState = {};

const fieldClasses =
  'mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-300 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15';

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink-700">
          Name <span className="text-ink-300">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={100}
          placeholder="Jane Doe"
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
          title="At least 8 characters with letters, numbers, and a symbol."
          placeholder="••••••••"
          className={fieldClasses}
        />
        <p className="mt-1.5 text-xs text-ink-500">
          At least 8 characters — must include letters, numbers, and a symbol.
        </p>
      </div>

      {state.error ? (
        <div
          role="alert"
          className="animate-fade-in flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>{state.error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group relative w-full overflow-hidden rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary-500"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Creating account…
            </>
          ) : (
            <>
              Create account
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </span>
      </button>
    </form>
  );
}
