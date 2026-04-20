import Link from 'next/link';
import { LoginForm } from './LoginForm';

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-400/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl"
      />

      <section className="relative w-full max-w-md animate-scale-in">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight text-ink-900">SkinX Posts</span>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white/80 p-7 shadow-xl shadow-primary-500/5 backdrop-blur">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-ink-500">Sign in to continue to your feed.</p>
          </header>

          <LoginForm next={next} />

          <p className="mt-6 text-center text-sm text-ink-500">
            New here?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary-600 transition hover:text-primary-700"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
