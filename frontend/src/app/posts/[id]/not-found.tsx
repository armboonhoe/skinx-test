import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="animate-fade-in-up mx-auto max-w-xl rounded-2xl border border-ink-200 bg-white p-10 text-center shadow-card">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Post not found</h1>
      <p className="mt-2 text-sm text-ink-500">
        The post you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/posts"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-600 hover:shadow-lg active:scale-95"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to posts
      </Link>
    </div>
  );
}
