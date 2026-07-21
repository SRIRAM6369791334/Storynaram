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

  aiProvider: z.string().default('mock'),
  aiModel: z.string().default('mock-model'),
  openaiApiKey: z.string().optional(),
  openaiBaseUrl: z.string().optional(),
  openaiOrganization: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  anthropicBaseUrl: z.string().optional(),
  geminiApiKey: z.string().optional(),
  geminiBaseUrl: z.string().optional(),
  openrouterApiKey: z.string().optional(),
  openrouterBaseUrl: z.string().optional(),
  azureOpenaiApiKey: z.string().optional(),
  azureOpenaiBaseUrl: z.string().optional(),
  ollamaHost: z.string().default('http://localhost:11434'),
  ollamaDefaultModel: z.string().default('llama3.2'),
  customAiApiKey: z.string().optional(),
  customAiBaseUrl: z.string().optional(),
  aiEnableCache: z.coerce.boolean().default(true),
  aiCacheTtlMs: z.coerce.number().int().positive().default(300000),
  aiRetryMax: z.coerce.number().int().min(0).default(3),
  aiFallbackProviders: z.string().default(''),
  aiFallbackModels: z.string().default(''),
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

    aiProvider: process.env.AI_PROVIDER,
    aiModel: process.env.AI_MODEL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL,
    openaiOrganization: process.env.OPENAI_ORGANIZATION,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiBaseUrl: process.env.GEMINI_BASE_URL,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterBaseUrl: process.env.OPENROUTER_BASE_URL,
    azureOpenaiApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenaiBaseUrl: process.env.AZURE_OPENAI_BASE_URL,
    ollamaHost: process.env.OLLAMA_HOST,
    ollamaDefaultModel: process.env.OLLAMA_DEFAULT_MODEL,
    customAiApiKey: process.env.CUSTOM_AI_API_KEY,
    customAiBaseUrl: process.env.CUSTOM_AI_BASE_URL,
    aiEnableCache: process.env.AI_ENABLE_CACHE,
    aiCacheTtlMs: process.env.AI_CACHE_TTL_MS,
    aiRetryMax: process.env.AI_RETRY_MAX,
    aiFallbackProviders: process.env.AI_FALLBACK_PROVIDERS,
    aiFallbackModels: process.env.AI_FALLBACK_MODELS,
  });

  if (!parsed.success) {
    throw new Error(`Invalid app configuration: ${parsed.error.message}`);
  }

  return parsed.data;
}
