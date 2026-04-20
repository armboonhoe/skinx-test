import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/client';

export interface ListFilter {
  tag?: string;
  q?: string;
}

export interface Pagination {
  skip: number;
  take: number;
}

const buildWhere = (filter: ListFilter): Prisma.PostWhereInput => {
  const where: Prisma.PostWhereInput = {};
  if (filter.tag) {
    where.tags = { some: { tag: { name: filter.tag } } };
  }
  if (filter.q) {
    where.title = { contains: filter.q, mode: 'insensitive' };
  }
  return where;
};

const COUNT_TTL_MS = 60_000;
const COUNT_MAX_ENTRIES = 256;
const countCache = new Map<string, { total: number; expiresAt: number }>();

const countCacheKey = (filter: ListFilter): string =>
  `t=${filter.tag ?? ''}|q=${(filter.q ?? '').toLowerCase()}`;

const getCount = async (filter: ListFilter, where: Prisma.PostWhereInput): Promise<number> => {
  const key = countCacheKey(filter);
  const now = Date.now();
  const hit = countCache.get(key);
  if (hit && hit.expiresAt > now) return hit.total;

  const total = await prisma.post.count({ where });

  if (countCache.size >= COUNT_MAX_ENTRIES) {
    for (const [k, v] of countCache) {
      if (v.expiresAt <= now) countCache.delete(k);
    }
    if (countCache.size >= COUNT_MAX_ENTRIES) {
      const oldest = countCache.keys().next().value;
      if (oldest) countCache.delete(oldest);
    }
  }
  countCache.set(key, { total, expiresAt: now + COUNT_TTL_MS });
  return total;
};

const TAGS_TTL_MS = 5 * 60_000;
let tagsCache: { data: { name: string; count: number }[]; expiresAt: number } | null = null;

/** Exposed for tests to invalidate caches between runs. */
export const __resetPostRepositoryCaches = (): void => {
  countCache.clear();
  tagsCache = null;
};

export const postRepository = {
  async findMany(filter: ListFilter, page: Pagination) {
    const where = buildWhere(filter);

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip: page.skip,
        take: page.take,
        select: {
          id: true,
          title: true,
          postedAt: true,
          postedBy: true,
          tags: { select: { tag: { select: { name: true } } } },
        },
      }),
      getCount(filter, where),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        title: p.title,
        postedAt: p.postedAt,
        postedBy: p.postedBy,
        tags: p.tags.map((t) => t.tag.name),
      })),
      total,
    };
  },

  async findById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        postedAt: true,
        postedBy: true,
        tags: { select: { tag: { select: { name: true } } } },
      },
    });
    if (!post) return null;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      postedAt: post.postedAt,
      postedBy: post.postedBy,
      tags: post.tags.map((t) => t.tag.name),
    };
  },

  async listTags() {
    const now = Date.now();
    if (tagsCache && tagsCache.expiresAt > now) return tagsCache.data;

    const tags = await prisma.tag.findMany({
      select: { name: true, _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
    const data = tags.map((t) => ({ name: t.name, count: t._count.posts }));
    tagsCache = { data, expiresAt: now + TAGS_TTL_MS };
    return data;
  },
};
