import { prisma } from '../../src/db/client';
import { hashPassword } from '../../src/utils/hash';

let uid = 0;

export const uniqueEmail = (): string => `user${Date.now()}${++uid}@test.local`;

export const createUser = async (overrides: Partial<{ email: string; password: string; name: string | null }> = {}) => {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? 'Valid@123';
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: overrides.name ?? 'Test User' },
  });
  return { ...user, plainPassword: password };
};

export const createTag = (name: string) => prisma.tag.create({ data: { name } });

export const createPost = async (
  overrides: Partial<{ title: string; content: string; postedBy: string; tags: string[] }> = {},
) => {
  const tagNames = overrides.tags ?? [];
  const tags = await Promise.all(
    tagNames.map((n) =>
      prisma.tag.upsert({ where: { name: n }, update: {}, create: { name: n } }),
    ),
  );

  return prisma.post.create({
    data: {
      title: overrides.title ?? 'Test Post',
      content: overrides.content ?? '<p>body</p>',
      postedAt: new Date(),
      postedBy: overrides.postedBy ?? 'Tester',
      tags: { create: tags.map((t) => ({ tagId: t.id })) },
    },
    include: { tags: { include: { tag: true } } },
  });
};
