import Link from 'next/link';

interface Props {
  page: number;
  totalPages: number;
  tag?: string;
}

const buildHref = (page: number, tag?: string): string => {
  const sp = new URLSearchParams();
  if (tag) sp.set('tag', tag);
  if (page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `/posts?${qs}` : '/posts';
};

const btnBase =
  'inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-sm transition-all active:scale-95';
const btnIdle = 'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700';
const btnDisabled = 'pointer-events-none opacity-40';

export function Pagination({ page, totalPages, tag }: Props) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const atStart = page === 1;
  const atEnd = page === totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-6 sm:flex-row"
    >
      <Link
        href={buildHref(prev, tag)}
        aria-disabled={atStart}
        className={`${btnBase} ${atStart ? btnDisabled : btnIdle}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Previous
      </Link>

      <div className="flex items-center gap-2 text-sm text-ink-500">
        <span>Page</span>
        <span className="rounded-md bg-primary-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-primary-500/30">
          {page}
        </span>
        <span>of</span>
        <span className="font-semibold text-ink-900">{totalPages}</span>
      </div>

      <Link
        href={buildHref(next, tag)}
        aria-disabled={atEnd}
        className={`${btnBase} ${atEnd ? btnDisabled : btnIdle}`}
      >
        Next
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </nav>
  );
}
