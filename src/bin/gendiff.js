#!/usr/bin/env node

import commander from 'commander';

const program = new commander.Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('0.0.1')
  .parse(process.argv);
