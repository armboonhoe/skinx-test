import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` },
  });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
  });
};
