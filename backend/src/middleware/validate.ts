import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { BadRequest } from '../utils/errors';

type Source = 'body' | 'query' | 'params';

export const validate =
  <T>(schema: ZodSchema<T>, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      (req as unknown as Record<Source, T>)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(BadRequest('Validation failed', err.flatten().fieldErrors));
        return;
      }
      next(err);
    }
  };
