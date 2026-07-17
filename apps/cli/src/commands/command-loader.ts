import { Command } from 'commander';
import { registerHelpCommand } from './help.command.js';
import { registerVersionCommand } from './version.command.js';

export class CommandLoader {
  loadCommands(program: Command): void {
    registerHelpCommand(program);
    registerVersionCommand(program);
  }
}
