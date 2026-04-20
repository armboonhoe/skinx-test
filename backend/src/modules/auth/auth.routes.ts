import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

const noop: RequestHandler = (_req: Request, _res: Response, next: NextFunction) => next();

// Skipped in test env so supertest can hammer /register /login freely.
const authLimiter: RequestHandler =
  env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: { code: 'RATE_LIMITED', message: 'Too many auth requests' } },
      });

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);

authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
