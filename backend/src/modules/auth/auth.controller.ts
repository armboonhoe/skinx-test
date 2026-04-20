import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env';
import { AUTH_COOKIE_NAME } from '../../middleware/auth';
import { NotFound } from '../../utils/errors';
import { authService } from './auth.service';

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions());
    res.status(201).json({ user: result.user, token: result.token });
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions());
    res.status(200).json({ user: result.user, token: result.token });
  },

  async logout(req: Request, res: Response): Promise<void> {
    if (req.user?.sessionId) {
      await authService.logout(req.user.sessionId);
    }
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
    res.status(204).end();
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = await authService.getById(req.user!.id);
    if (!user) throw NotFound('User not found');
    res.status(200).json({ user });
  },
};
