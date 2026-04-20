import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { postController } from './post.controller';
import { listPostsQuerySchema, postIdParamSchema } from './post.schema';

export const postsRouter = Router();

// All routes require auth. The tag list is cached in-memory on the backend
// (5 min TTL) — cheaper than a DB round-trip per request, and every caller
// is still individually authenticated (no cross-user cache poisoning).
postsRouter.use(requireAuth);

postsRouter.get('/tags', asyncHandler(postController.listTags));

postsRouter.get(
  '/',
  validate(listPostsQuerySchema, 'query'),
  asyncHandler(postController.list),
);

postsRouter.get(
  '/:id',
  validate(postIdParamSchema, 'params'),
  asyncHandler(postController.getById),
);
