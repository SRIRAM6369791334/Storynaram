import pino from 'pino';
import { createCliConfig, type CliConfig } from '../config/cli.config';

export class CliLogger {
  private logger: pino.Logger;

  constructor(config?: Partial<CliConfig>) {
    const resolved = createCliConfig(config);
    this.logger = pino({
      level: resolved.logLevel,
      ...(resolved.prettyLog && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss Z' },
        },
      }),
    });
  }

  info(msg: string, ...args: unknown[]): void {
    (this.logger.info as (msg: string, ...args: unknown[]) => void)(msg, ...args);
  }

  warn(msg: string, ...args: unknown[]): void {
    (this.logger.warn as (msg: string, ...args: unknown[]) => void)(msg, ...args);
  }

  error(msg: string, ...args: unknown[]): void {
    (this.logger.error as (msg: string, ...args: unknown[]) => void)(msg, ...args);
  }

  debug(msg: string, ...args: unknown[]): void {
    (this.logger.debug as (msg: string, ...args: unknown[]) => void)(msg, ...args);
  }
}
