import { z } from 'zod';

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(4000),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  jwtSecret: z.string().min(32).default('storynaram-jwt-secret-change-in-production'),
  jwtExpiresIn: z.string().default('15m'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  redisHost: z.string().default('localhost'),
  redisPort: z.coerce.number().int().positive().default(6379),
  redisPassword: z.string().optional(),
  corsOrigins: z.string().default('*'),
  rateLimitTtl: z.coerce.number().int().positive().default(60),
  rateLimitMax: z.coerce.number().int().positive().default(100),
  storagePath: z.string().default('./storage'),
  searchIndexPath: z.string().default('./search-index'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export function loadAppConfig(): AppConfig {
  const parsed = appConfigSchema.safeParse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
    corsOrigins: process.env.CORS_ORIGINS,
    rateLimitTtl: process.env.RATE_LIMIT_TTL,
    rateLimitMax: process.env.RATE_LIMIT_MAX,
    storagePath: process.env.STORAGE_PATH,
    searchIndexPath: process.env.SEARCH_INDEX_PATH,
  });

  if (!parsed.success) {
    throw new Error(`Invalid app configuration: ${parsed.error.message}`);
  }

  return parsed.data;
}
