import fs from 'fs';
import gendiff from '../src';

const pathToFixtures = `${__dirname}/../__fixtures__`;
const exts = ['json', 'yml', 'ini'];

const result = fs.readFileSync(`${pathToFixtures}/result.txt`, 'utf8');

test.each(exts)('compare two configs', (ext) => {
  const firstConfig = `${pathToFixtures}/before.${ext}`;
  const secondConfig = `${pathToFixtures}/after.${ext}`;

  expect(gendiff(firstConfig, secondConfig)).toEqual(result);
});
