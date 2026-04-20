'use client';

export default function PostsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="animate-fade-in-up mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-ink-900">Something went wrong</h2>
      <p className="mt-1 text-sm text-ink-500">
        We couldn&apos;t load the posts right now.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-600 hover:shadow-lg active:scale-95"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
        </svg>
        Try again
      </button>
    </div>
  );
}
