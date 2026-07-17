import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
    ) as { version?: string };
    return pkg.version ?? '2.1.0';
  } catch {
    return '2.1.0';
  }
}

export function registerVersionCommand(program: Command): void {
  program
    .option('-v, --version', 'Display version information')
    .on('option:version', () => {
      console.log(`Storynaram CLI v${getVersion()}`);
      process.exit(0);
    });
}
