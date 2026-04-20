import type { Request, Response } from 'express';
import { postService } from './post.service';

export const postController = {
  async list(req: Request, res: Response): Promise<void> {
    const data = await postService.list(req.query as never);
    res.status(200).json(data);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const post = await postService.getById(req.params.id);
    res.status(200).json({ post });
  },

  async listTags(_req: Request, res: Response): Promise<void> {
    const tags = await postService.listTags();
    res.status(200).json({ tags });
  },
};
