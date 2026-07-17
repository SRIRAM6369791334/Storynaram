import { CliLogger } from './logger/cli.logger.js';
import { CommandLoader } from './commands/command-loader.js';

export class CliModule {
  readonly logger: CliLogger;
  readonly commandLoader: CommandLoader;

  constructor() {
    this.logger = new CliLogger();
    this.commandLoader = new CommandLoader();
  }

  async init(): Promise<void> {
    this.logger.debug('CLI module initialized');
  }

  async destroy(): Promise<void> {
    this.logger.debug('CLI module destroyed');
  }
}
