import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { sanitizeHtml } from '@/lib/sanitize';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;

  let post;
  try {
    const res = await api.posts.get(id);
    post = res.post;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound();
    throw err;
  }

  const safeHtml = sanitizeHtml(post.content);
  const initial = post.postedBy.charAt(0).toUpperCase();

  return (
    <article className="mx-auto max-w-3xl animate-fade-in-up">
      <nav className="mb-6">
        <Link
          href="/posts"
          className="group inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to posts
        </Link>
      </nav>

      <header className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-400/5 blur-3xl"
        />

        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {post.title}
          </h1>

          <dl className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Author</dt>
              <dd className="flex items-center gap-2 font-medium text-ink-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-primary-600 text-xs font-bold text-white shadow-md shadow-primary-500/30">
                  {initial}
                </span>
                {post.postedBy}
              </dd>
            </div>
            <span className="text-ink-300">·</span>
            <div>
              <dt className="sr-only">Posted at</dt>
              <dd className="text-ink-500">
                <time dateTime={post.postedAt}>{formatDate(post.postedAt)}</time>
              </dd>
            </div>
          </dl>

          {post.tags.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-100 transition hover:bg-primary-100 hover:ring-primary-200"
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: server-side sanitized */}
      <section
        className="prose-post mt-8 animate-fade-in"
        style={{ animationDelay: '150ms' }}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </article>
  );
}
