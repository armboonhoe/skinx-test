import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { corsOrigins, env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authRouter } from './modules/auth/auth.routes';
import { postsRouter } from './modules/posts/post.routes';
import { logger } from './utils/logger';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      // REST API never serves HTML; disable CSP (would block legitimate JSON clients)
      // and harden CORP to same-site to prevent embedding in foreign origins.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  // Skip gzip on authentication responses to eliminate the BREACH attack surface
  // (compressed responses + reflected user input can leak secrets like JWTs).
  app.use(
    compression({
      filter: (req, res) => {
        if (req.path.startsWith('/api/auth/')) return false;
        return compression.filter(req, res);
      },
    }),
  );
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Global rate limit — additional per-route limits on /auth.
  // Skipped in test env so supertest can hammer endpoints without hitting 429.
  if (env.NODE_ENV !== 'test') {
    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        limit: 300,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
      }),
    );
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/posts', postsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
