import { afterAll, beforeAll, beforeEach } from 'vitest';
import { prisma } from '../../src/db/client';
import { __resetPostRepositoryCaches } from '../../src/modules/posts/post.repository';
import { lockout } from '../../src/modules/auth/lockout';

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  // Truncate in FK-safe order; RESTART IDENTITY resets auto-increment (noop here, cuid).
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "post_tags", "sessions", "posts", "tags", "users" RESTART IDENTITY CASCADE',
  );
  __resetPostRepositoryCaches();
  lockout.clearAll();
});

afterAll(async () => {
  await prisma.$disconnect();
});
