import { prisma } from '../../db/client';
import { AppError, Conflict, Unauthorized } from '../../utils/errors';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { signJwt } from '../../utils/jwt';
import { lockout } from './lockout';
import type { LoginDto, RegisterDto } from './auth.schema';

export interface AuthResult {
  token: string;
  user: { id: string; email: string; name: string | null };
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const issueSession = async (user: {
  id: string;
  email: string;
  name: string | null;
}): Promise<AuthResult> => {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
    select: { id: true },
  });
  const token = signJwt({ sub: user.id, email: user.email, jti: session.id });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
};

const LockedError = (retryAfterMs: number) =>
  new AppError(
    429,
    'ACCOUNT_LOCKED',
    'Too many failed attempts. Please try again later.',
    { retryAfterSeconds: Math.ceil(retryAfterMs / 1000) },
  );

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw Conflict('Email is already registered');

    const passwordHash = await hashPassword(dto.password);
    const user = await prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name ?? null },
      select: { id: true, email: true, name: true },
    });
    return issueSession(user);
  },

  async login(dto: LoginDto): Promise<AuthResult> {
    const locked = lockout.check(dto.email);
    if (locked > 0) throw LockedError(locked);

    const user = await prisma.user.findUnique({ where: { email: dto.email } });

    // Always run bcrypt compare against a real hash shape to avoid timing oracle
    // that reveals whether the email exists.
    const dummyHash = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8fG3T6H0WmvTfTzvaS9pDZZH2f4hfC';
    const hash = user?.passwordHash ?? dummyHash;
    const ok = await verifyPassword(dto.password, hash);

    if (!user || !ok) {
      lockout.recordFailure(dto.email);
      throw Unauthorized('Invalid email or password');
    }

    lockout.reset(dto.email);
    return issueSession({ id: user.id, email: user.email, name: user.name });
  },

  async logout(sessionId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  },
};

