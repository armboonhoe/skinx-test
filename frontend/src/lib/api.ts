import 'server-only';
import { env } from './env';
import { getAuthToken } from './auth';
import type {
  ApiError,
  PaginatedPosts,
  PostDetail,
  SessionUser,
  TagCount,
} from './types';

class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(body.error?.message ?? 'API request failed');
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'cache'> {
  body?: unknown;
  auth?: boolean;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { auth = true, body, headers, cache, next, ...init } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');
  if (body !== undefined) finalHeaders.set('Content-Type', 'application/json');

  if (auth) {
    const token = await getAuthToken();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const fetchInit: RequestInit & { next?: NextFetchRequestConfig } = {
    ...init,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  if (next) fetchInit.next = next;
  else fetchInit.cache = cache ?? 'no-store';

  const res = await fetch(`${env.BACKEND_API_URL}${path}`, fetchInit);

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(
      res.status,
      errBody ?? {
        error: { code: 'UNKNOWN_ERROR', message: `HTTP ${res.status}` },
      },
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};

export const api = {
  auth: {
    register: (input: { email: string; password: string; name?: string }) =>
      request<{ user: SessionUser; token: string }>('/api/auth/register', {
        method: 'POST',
        body: input,
        auth: false,
      }),
    login: (input: { email: string; password: string }) =>
      request<{ user: SessionUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: input,
        auth: false,
      }),
    me: () => request<{ user: SessionUser }>('/api/auth/me'),
  },
  posts: {
    list: (query: {
      page?: number;
      pageSize?: number;
      tag?: string;
      q?: string;
    }) => {
      const sp = new URLSearchParams();
      if (query.page) sp.set('page', String(query.page));
      if (query.pageSize) sp.set('pageSize', String(query.pageSize));
      if (query.tag) sp.set('tag', query.tag);
      if (query.q) sp.set('q', query.q);
      const qs = sp.toString();
      return request<PaginatedPosts>(`/api/posts${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<{ post: PostDetail }>(`/api/posts/${encodeURIComponent(id)}`),
    // Tags are authenticated; the backend holds a 5-minute in-memory cache so
    // repeat calls don't hit the DB. We intentionally do NOT use Next fetch
    // revalidation: it's keyed by URL only, and would share one user's response
    // across all callers without re-validating their JWT.
    tags: () => request<{ tags: TagCount[] }>('/api/posts/tags'),
  },
};

export { ApiRequestError };
