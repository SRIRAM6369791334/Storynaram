import { Command } from 'commander';

export function registerHelpCommand(program: Command): void {
  program
    .option('-h, --help', 'Display help information')
    .on('option:help', () => {
      console.log('');
      console.log('Storynaram CLI - Interactive world-building tool');
      console.log('');
      console.log('Usage:');
      console.log('  storynaram [command] [options]');
      console.log('');
      console.log('Commands:');
      console.log('  help     Display this help message');
      console.log('  version  Display version information');
      console.log('');
      console.log('Run "storynaram <command> --help" for more details.');
      process.exit(0);
    });

  program.on('--help', () => {
    console.log('');
    console.log('Storynaram CLI - Interactive world-building tool');
    console.log('');
    console.log('Usage:');
    console.log('  storynaram [command] [options]');
    console.log('');
    console.log('Commands:');
    console.log('  help     Display this help message');
    console.log('  version  Display version information');
    console.log('');
  });
}
