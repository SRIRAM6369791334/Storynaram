import { DynamicModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerOptions } from 'pino';

export interface LoggerConfig {
  level?: string;
}

export function createLoggerOptions(config?: LoggerConfig): LoggerOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    level: config?.level ?? (isProduction ? 'info' : 'debug'),
    ...(!isProduction && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss Z' },
      },
    }),
  };
}

export class LoggerModule {
  static forRoot(config?: LoggerConfig): DynamicModule {
    return {
      module: LoggerModule,
      global: true,
      imports: [
        PinoLoggerModule.forRoot({
          pinoHttp: createLoggerOptions(config),
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
