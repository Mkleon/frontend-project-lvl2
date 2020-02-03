#!/usr/bin/env node

import commander from 'commander';
import gendiff from '..';
import { version } from '../../package.json';

const program = new commander.Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version(version)
  .option('-f, --format [type]', 'output format (json|tree|plain)', 'json')
  .arguments('<firstConfig> <secondConfig>')
  .action((firstConfig, secondConfig) => {
    console.log(gendiff(firstConfig, secondConfig, program.format));
  });

program.parse(process.argv);
