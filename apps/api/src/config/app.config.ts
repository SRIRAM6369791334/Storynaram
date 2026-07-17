import { z } from 'zod';

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(4000),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export default function appConfig(): AppConfig {
  const parsed = appConfigSchema.safeParse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
  });

  if (!parsed.success) {
    throw new Error(`Invalid app configuration: ${parsed.error.message}`);
  }

  return parsed.data;
}
