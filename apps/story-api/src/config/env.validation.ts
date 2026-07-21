import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  JWT_SECRET: z.string().min(32).default('storynaram-jwt-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  CORS_ORIGINS: z.string().default('*'),
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  STORAGE_PATH: z.string().default('./storage'),
  SEARCH_INDEX_PATH: z.string().default('./search-index'),

  AI_PROVIDER: z.string().default('mock'),
  AI_MODEL: z.string().default('mock-model'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_ORGANIZATION: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_BASE_URL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_BASE_URL: z.string().optional(),
  OLLAMA_HOST: z.string().default('http://localhost:11434'),
  OLLAMA_DEFAULT_MODEL: z.string().default('llama3.2'),
  CUSTOM_AI_API_KEY: z.string().optional(),
  CUSTOM_AI_BASE_URL: z.string().optional(),
  AI_ENABLE_CACHE: z.string().default('true'),
  AI_CACHE_TTL_MS: z.string().default('300000'),
  AI_RETRY_MAX: z.string().default('3'),
  AI_FALLBACK_PROVIDERS: z.string().default(''),
  AI_FALLBACK_MODELS: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${missing}`);
  }

  return result.data;
}
