import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env';
import { prisma } from '../db/client';
import { hashPassword } from '../utils/hash';
import { logger } from '../utils/logger';

interface RawPost {
  title: string;
  content: string;
  postedAt: string;
  postedBy: string;
  tags: string[];
}

const BATCH_SIZE = 500;

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const seedDemoUser = async (): Promise<void> => {
  const existing = await prisma.user.findUnique({ where: { email: env.SEED_DEMO_EMAIL } });
  if (existing) {
    logger.info(`Demo user exists: ${env.SEED_DEMO_EMAIL}`);
    return;
  }
  const passwordHash = await hashPassword(env.SEED_DEMO_PASSWORD);
  await prisma.user.create({
    data: { email: env.SEED_DEMO_EMAIL, passwordHash, name: 'Demo User' },
  });
  logger.info(`Seeded demo user: ${env.SEED_DEMO_EMAIL} / ${env.SEED_DEMO_PASSWORD}`);
};

const seedPosts = async (): Promise<void> => {
  const filePath = path.resolve(process.cwd(), env.SEED_FILE_PATH);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filePath}`);
  }

  const existingCount = await prisma.post.count();
  if (existingCount > 0) {
    logger.warn(`Posts table already has ${existingCount} rows — skipping seed`);
    return;
  }

  logger.info(`Reading ${filePath}`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const posts = JSON.parse(raw) as RawPost[];
  logger.info(`Parsed ${posts.length} posts`);

  // 1. Deduplicate tag names and insert
  const tagNames = Array.from(
    new Set(posts.flatMap((p) => (p.tags ?? []).map((t) => t.trim()).filter(Boolean))),
  ).sort();

  logger.info(`Upserting ${tagNames.length} unique tags`);
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const allTags = await prisma.tag.findMany({ select: { id: true, name: true } });
  const tagIdByName = new Map(allTags.map((t) => [t.name, t.id] as const));

  // 2. Insert posts in batches, capturing created IDs
  logger.info(`Inserting posts in batches of ${BATCH_SIZE}`);
  let inserted = 0;
  const postTagRows: { postId: string; tagId: string }[] = [];

  for (const batch of chunk(posts, BATCH_SIZE)) {
    const created = await prisma.$transaction(
      batch.map((p) =>
        prisma.post.create({
          data: {
            title: p.title,
            content: p.content,
            postedAt: new Date(p.postedAt),
            postedBy: p.postedBy,
          },
          select: { id: true },
        }),
      ),
    );

    batch.forEach((p, idx) => {
      const postId = created[idx].id;
      for (const tagName of p.tags ?? []) {
        const tagId = tagIdByName.get(tagName.trim());
        if (tagId) postTagRows.push({ postId, tagId });
      }
    });

    inserted += batch.length;
    if (inserted % (BATCH_SIZE * 4) === 0 || inserted === posts.length) {
      logger.info(`  inserted ${inserted}/${posts.length}`);
    }
  }

  logger.info(`Inserting ${postTagRows.length} post-tag links`);
  for (const rows of chunk(postTagRows, 2000)) {
    await prisma.postTag.createMany({ data: rows, skipDuplicates: true });
  }

  logger.info('Seed complete');
};

const main = async (): Promise<void> => {
  try {
    await seedDemoUser();
    await seedPosts();
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
