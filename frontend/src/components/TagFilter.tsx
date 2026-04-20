import Link from 'next/link';
import type { TagCount } from '@/lib/types';

interface Props {
  tags: TagCount[];
  selected: string | undefined;
}

const buildHref = (tag: string | null): string => {
  const sp = new URLSearchParams();
  if (tag) sp.set('tag', tag);
  const qs = sp.toString();
  return qs ? `/posts?${qs}` : '/posts';
};

const chipBase =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95';
const chipActive =
  'bg-primary-500 text-white shadow-md shadow-primary-500/30 ring-1 ring-primary-500';
const chipIdle =
  'bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200';

export function TagFilter({ tags, selected }: Props) {
  return (
    <nav aria-label="Filter posts by tag" className="flex flex-wrap gap-2">
      <Link
        href={buildHref(null)}
        className={`${chipBase} ${!selected ? chipActive : chipIdle}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        All
      </Link>
      {tags.map((t) => {
        const active = selected === t.name;
        return (
          <Link
            key={t.name}
            href={buildHref(t.name)}
            aria-pressed={active}
            className={`${chipBase} ${active ? chipActive : chipIdle}`}
          >
            {t.name}
            <span
              className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-500'
              }`}
            >
              {t.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
