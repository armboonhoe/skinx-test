import { notFound } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/Pagination';
import { TagFilter } from '@/components/TagFilter';
import { api } from '@/lib/api';

interface Props {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

const PAGE_SIZE = 20;

/** Strictly digit-only positive integer; returns null for malformed input. */
const parsePage = (raw: string | undefined): number | null => {
  if (raw === undefined || raw === '') return 1;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number.parseInt(raw, 10);
  return n >= 1 ? n : null;
};

const parseTag = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 && trimmed.length <= 64 ? trimmed : undefined;
};

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parsePage(params.page);
  if (page === null) notFound();
  const tag = parseTag(params.tag);

  const [list, tagsRes] = await Promise.all([
    api.posts.list({ page, pageSize: PAGE_SIZE, tag }),
    api.posts.tags(),
  ]);

  return (
    <div className="space-y-8">
      <section className="animate-fade-in-up">
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Discover <span className="text-primary-500">posts</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {list.total.toLocaleString()} posts in total
          {tag ? (
            <>
              {' '}
              · filtered by{' '}
              <span className="inline-flex rounded-md bg-primary-100 px-1.5 font-semibold text-primary-700">
                {tag}
              </span>
            </>
          ) : null}
        </p>
      </section>

      <section
        aria-labelledby="filter-heading"
        className="animate-fade-in-up"
        style={{ animationDelay: '80ms' }}
      >
        <h2 id="filter-heading" className="sr-only">
          Filter by tag
        </h2>
        <TagFilter tags={tagsRes.tags} selected={tag} />
      </section>

      {list.items.length === 0 ? (
        <div className="animate-fade-in rounded-2xl border-2 border-dashed border-ink-200 bg-white/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-ink-900">No posts match this filter</p>
          <p className="mt-1 text-xs text-ink-500">Try a different tag or clear the filter.</p>
        </div>
      ) : (
        <ul className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.items.map((post, idx) => (
            <li
              key={post.id}
              style={{ ['--i' as string]: Math.min(idx, 20) }}
              className="h-full"
            >
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={list.page} totalPages={list.totalPages} tag={tag} />
    </div>
  );
}
