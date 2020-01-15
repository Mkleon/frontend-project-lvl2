import fs from 'fs';
import gendiff from '../src';

test('compare two JSON configs', () => {
  const result1 = fs.readFileSync(`${__dirname}/__fixtures__/result1.txt`, 'utf8');
  const firstConfig = `${__dirname}/__fixtures__/before.json`;
  const secondConfig = `${__dirname}/__fixtures__/after.json`;

  expect(gendiff(firstConfig, secondConfig)).toEqual(result1);
});
