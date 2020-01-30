#!/usr/bin/env node

import commander from 'commander';
import differ from '..';
import { version } from '../../package.json';

const program = new commander.Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version(version)
  .option('-f, --format [type]', 'Output format', 'json')
  .arguments('<firstConfig> <secondConfig>')
  .action(differ);

program.parse(process.argv);
