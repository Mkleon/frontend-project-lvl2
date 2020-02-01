#!/usr/bin/env node

import commander from 'commander';
import gendiff from '..';
import { version } from '../../package.json';

const program = new commander.Command();
let first;
let second;

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version(version)
  .option('-f, --format [type]', 'Output format', 'json')
  .arguments('<firstConfig> <secondConfig>')
  .action((firstConfig, secondConfig) => {
    first = firstConfig;
    second = secondConfig;
  });

program.parse(process.argv);

console.log(gendiff(first, second, program.format));
