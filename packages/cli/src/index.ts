#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';

const program = new Command();

program
  .name('blotch')
  .description('Add @blotch/ui components to your AngularLynx project')
  .version('0.0.1');

program
  .command('init')
  .description('Initialize blotch in your project')
  .action(initCommand);

program
  .command('add')
  .description('Add components to your project')
  .argument('[components...]', 'components to add')
  .action(addCommand);

program.parse();
