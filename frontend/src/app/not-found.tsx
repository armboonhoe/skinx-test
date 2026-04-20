import Link from 'next/link';

export default function NotFound() {
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

      <section className="animate-fade-in-up relative mx-auto max-w-xl rounded-2xl border border-ink-200 bg-white/80 p-10 text-center shadow-xl shadow-primary-500/5 backdrop-blur">
        <p className="text-sm font-semibold tracking-widest text-primary-500">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">Page not found</h1>
        <p className="mt-3 text-sm text-ink-500">
          The page or parameter you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/posts"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-600 hover:shadow-lg active:scale-95"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to posts
        </Link>
      </section>
    </main>
  );
}
