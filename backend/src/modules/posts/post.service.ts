import { NotFound } from '../../utils/errors';
import { postRepository } from './post.repository';
import type { ListPostsQuery } from './post.schema';

export const postService = {
  async list(query: ListPostsQuery) {
    const skip = (query.page - 1) * query.pageSize;
    const { items, total } = await postRepository.findMany(
      { tag: query.tag, q: query.q },
      { skip, take: query.pageSize },
    );

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  },

  async getById(id: string) {
    const post = await postRepository.findById(id);
    if (!post) throw NotFound('Post not found');
    return post;
  },

  listTags: postRepository.listTags,
};
