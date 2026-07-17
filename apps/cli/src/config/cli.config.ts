import { z } from 'zod';

const cliConfigSchema = z.object({
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  prettyLog: z.boolean().default(true),
});

export type CliConfig = z.infer<typeof cliConfigSchema>;

export function createCliConfig(overrides?: Partial<CliConfig>): CliConfig {
  return cliConfigSchema.parse({
    logLevel: process.env.LOG_LEVEL ?? 'info',
    prettyLog: process.env.CLI_PRETTY_LOG !== 'false',
    ...overrides,
  });
}
