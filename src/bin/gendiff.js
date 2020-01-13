#!/usr/bin/env node

import commander from 'commander';
import differ from '../gendiff';

const program = new commander.Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('0.0.1')
  .option('-f, --format <type>', 'Output format')
  .arguments('<firstConfig> <secondConfig>')
  .action(differ)
  .parse(process.argv);
