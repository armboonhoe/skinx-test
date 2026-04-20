import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { PostSummary } from '@/lib/types';

export function PostCard({ post }: { post: PostSummary }) {
  const initial = post.postedBy.charAt(0).toUpperCase();

  return (
    <Link
      href={`/posts/${encodeURIComponent(post.id)}`}
      className="group relative block h-full overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary-500/0 blur-2xl transition-all duration-500 group-hover:bg-primary-500/30"
      />

      <article className="relative flex h-full flex-col">
        <h2 className="text-base font-semibold text-ink-900 transition-colors line-clamp-2 group-hover:text-primary-600">
          {post.title}
        </h2>

        <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Author</dt>
            <dd className="flex items-center gap-1.5 font-medium text-ink-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-primary-600 text-[10px] font-bold text-white">
                {initial}
              </span>
              {post.postedBy}
            </dd>
          </div>
          <span className="text-ink-300">·</span>
          <div>
            <dt className="sr-only">Posted at</dt>
            <dd>
              <time dateTime={post.postedAt}>{formatDate(post.postedAt)}</time>
            </dd>
          </div>
        </dl>

        {post.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
            {post.tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 ring-1 ring-inset ring-primary-100"
              >
                {tag}
              </li>
            ))}
            {post.tags.length > 4 ? (
              <li className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-500">
                +{post.tags.length - 4}
              </li>
            ) : null}
          </ul>
        ) : null}

        <span
          aria-hidden
          className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-primary-500 opacity-0 transition-all duration-300 group-hover:opacity-100"
        >
          Read more
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </article>
    </Link>
  );
}
