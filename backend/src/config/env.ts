import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Express trust proxy. Use `false` for direct exposure, a number (hops) or an
  // IP/CIDR list only when the app runs behind a trusted reverse proxy — otherwise
  // X-Forwarded-For can be spoofed to bypass IP-based rate limits.
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((v) => {
      if (v === 'false') return false;
      if (v === 'true') return true;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    }),

  SEED_FILE_PATH: z.string().default('../posts.json'),
  SEED_DEMO_EMAIL: z.string().email().default('demo@skinx.local'),
  SEED_DEMO_PASSWORD: z.string().min(8).default('Demo@1234'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
