import { z } from 'zod';

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  tag: z.string().trim().min(1).max(64).optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const postIdParamSchema = z.object({
  id: z.string().min(1).max(64),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
