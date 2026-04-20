import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './db/client';
import { logger } from './utils/logger';

const start = async (): Promise<void> => {
  const app = createApp();

  await prisma.$connect();
  logger.info('Connected to PostgreSQL');

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
