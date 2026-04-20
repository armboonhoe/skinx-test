import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/client';
import { Unauthorized } from '../utils/errors';
import { verifyJwt } from '../utils/jwt';

export interface AuthenticatedUser {
  id: string;
  email: string;
  sessionId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const AUTH_COOKIE_NAME = 'skinx_token';

const extractToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
};

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    next(Unauthorized('Authentication required'));
    return;
  }

  try {
    const payload = verifyJwt(token);
    const session = await prisma.session.findUnique({
      where: { id: payload.jti },
      select: { userId: true, revokedAt: true, expiresAt: true },
    });

    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date()
    ) {
      next(Unauthorized('Session is no longer valid'));
      return;
    }

    req.user = { id: payload.sub, email: payload.email, sessionId: payload.jti };
    next();
  } catch {
    next(Unauthorized('Invalid or expired token'));
  }
};
