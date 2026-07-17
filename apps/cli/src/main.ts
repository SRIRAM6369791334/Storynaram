import 'reflect-metadata';
import { Command } from 'commander';
import { CommandLoader } from './commands/command-loader.js';
import { CliModule } from './cli.module.js';

async function main(): Promise<void> {
  const cli = new CliModule();
  await cli.init();

  const program = new Command()
    .name('storynaram')
    .description('Storynaram CLI - Interactive world-building tool')
    .version('2.1.0');

  const loader = new CommandLoader();
  loader.loadCommands(program);

  program.parse(process.argv);

  await cli.destroy();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
