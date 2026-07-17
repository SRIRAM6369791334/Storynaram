import { DynamicModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export class AppConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly logLevel: string;

  constructor(data: z.infer<typeof envSchema>) {
    this.nodeEnv = data.NODE_ENV;
    this.port = data.PORT;
    this.logLevel = data.LOG_LEVEL;
  }
}

export abstract class ConfigPort {
  abstract get(key: string): unknown;
}

export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      imports: [
        NestConfigModule.forRoot({
          validate: (config: Record<string, unknown>) => {
            const parsed = envSchema.parse(config);
            return new AppConfig(parsed);
          },
          isGlobal: true,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
